// FinanFun Simple API Server
const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const PORT = 8080;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// CORS headers
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Initialize database
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT,
        provider TEXT,
        provider_id TEXT,
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }
}

// Create server
const server = http.createServer(async (req, res) => {
  setCORSHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  try {
    // Register endpoint
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const body = await parseBody(req);
      const { name, email, password, provider, provider_id } = body;

      const client = await pool.connect();
      try {
        // Check if user exists
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
          sendJSON(res, 400, { error: 'Usuário já existe' });
          return;
        }

        await client.query('BEGIN');

        // Hash password
        let passwordHash = null;
        if (password) {
          passwordHash = await bcrypt.hash(password, 10);
        }

        // Create user
        const userResult = await client.query(
          `INSERT INTO users (email, name, password_hash, provider, provider_id, role)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, uuid, email, name, provider, avatar_url, is_verified, role, created_at`,
          [email, name, passwordHash, provider || 'email', provider_id, 'user']
        );

        const user = userResult.rows[0];

        // Create session
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
        
        await client.query(
          'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address) VALUES ($1, $2, $3, $4)',
          [user.id, sessionToken, expiresAt, req.connection.remoteAddress]
        );

        await client.query('COMMIT');

        sendJSON(res, 200, {
          success: true,
          user,
          session_token: sessionToken
        });

      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration error:', error);
        sendJSON(res, 500, { error: 'Erro interno do servidor' });
      } finally {
        client.release();
      }
    }
    
    // Login endpoint
    else if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const { email, password } = body;

      const result = await pool.query(
        'SELECT id, uuid, email, name, password_hash, provider, avatar_url, is_verified, role FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        sendJSON(res, 401, { error: 'Credenciais inválidas' });
        return;
      }

      const user = result.rows[0];

      if (!user.password_hash || !await bcrypt.compare(password, user.password_hash)) {
        sendJSON(res, 401, { error: 'Credenciais inválidas' });
        return;
      }

      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

      // Create session
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
      
      await pool.query(
        'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address) VALUES ($1, $2, $3, $4)',
        [user.id, sessionToken, expiresAt, req.connection.remoteAddress]
      );

      const { password_hash, ...safeUser } = user;

      sendJSON(res, 200, {
        success: true,
        user: safeUser,
        session_token: sessionToken
      });
    }
    
    // Google OAuth login initiation
    else if (pathname === '/api/auth/google' && req.method === 'GET') {
      const clientId = process.env.GOOGLE_CLIENT_ID || 'demo-client-id';
      const redirectUri = `${req.headers.origin || 'http://localhost:5000'}/api/auth/google/callback`;
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid%20email%20profile&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      res.writeHead(302, { 'Location': authUrl });
      res.end();
    }
    
    // Google OAuth callback
    else if (pathname === '/api/auth/google/callback' && req.method === 'GET') {
      const urlParams = new URL(req.url, 'http://localhost').searchParams;
      const code = urlParams.get('code');
      
      if (!code) {
        sendJSON(res, 400, { error: 'Authorization code not provided' });
        return;
      }
      
      try {
        // Exchange code for tokens
        const tokenResponse = await exchangeCodeForTokens(code, req.headers.origin);
        
        if (!tokenResponse.access_token) {
          throw new Error('Failed to get access token');
        }
        
        // Get user info from Google
        const userInfo = await getUserInfoFromGoogle(tokenResponse.access_token);
        
        // Check if user exists or create new user
        let result = await pool.query(
          'SELECT id, uuid, email, name, provider, avatar_url, is_verified, role FROM users WHERE email = $1',
          [userInfo.email]
        );
        
        let user;
        if (result.rows.length === 0) {
          // Create new user
          const insertResult = await pool.query(`
            INSERT INTO users (email, name, provider, provider_id, avatar_url, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, uuid, email, name, provider, avatar_url, is_verified, role, created_at
          `, [userInfo.email, userInfo.name, 'google', userInfo.sub, userInfo.picture, userInfo.email_verified]);
          
          user = insertResult.rows[0];
        } else {
          user = result.rows[0];
          // Update last login
          await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        }
        
        // Create session
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
        
        await pool.query(
          'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address) VALUES ($1, $2, $3, $4)',
          [user.id, sessionToken, expiresAt, req.connection.remoteAddress]
        );
        
        // Redirect to frontend with session token
        const redirectUrl = `${req.headers.origin || 'http://localhost:5000'}?login=success&token=${sessionToken}&user=${encodeURIComponent(JSON.stringify(user))}`;
        res.writeHead(302, { 'Location': redirectUrl });
        res.end();
        
      } catch (error) {
        console.error('Google OAuth error:', error);
        const errorUrl = `${req.headers.origin || 'http://localhost:5000'}?login=error&message=${encodeURIComponent('Erro no login com Google')}`;
        res.writeHead(302, { 'Location': errorUrl });
        res.end();
      }
    }
    
    // Logout endpoint
    else if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const body = await parseBody(req);
      const { session_token } = body;
      
      if (session_token) {
        await pool.query('DELETE FROM user_sessions WHERE session_token = $1', [session_token]);
      }
      
      sendJSON(res, 200, { success: true });
    }
    
    // Health endpoint
    else if (pathname === '/api/health' && req.method === 'GET') {
      try {
        const client = await pool.connect();
        client.release();
        const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
        
        sendJSON(res, 200, {
          status: 'ok',
          database: 'connected',
          users: parseInt(userCount.rows[0].count),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        sendJSON(res, 500, {
          status: 'error',
          database: 'disconnected',
          error: error.message
        });
      }
    }
    
    // 404 for other routes
    else {
      sendJSON(res, 404, { error: 'Endpoint not found' });
    }

  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, 500, { error: 'Internal server error' });
  }
});

// Helper functions for Google OAuth
async function exchangeCodeForTokens(code, origin) {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'demo-client-id';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'demo-client-secret';
  const redirectUri = `${origin || 'http://localhost:5000'}/api/auth/google/callback`;
  
  const tokenData = querystring.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri
  });
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(tokenData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(tokenData);
    req.end();
  });
}

async function getUserInfoFromGoogle(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: '/oauth2/v2/userinfo',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Start server
async function startServer() {
  await initDB();
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`FinanFun API Server running on port ${PORT}`);
  });
}

startServer();