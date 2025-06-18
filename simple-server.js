// FinanFun Simple API Server
const http = require('http');
const url = require('url');
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

// Start server
async function startServer() {
  await initDB();
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`FinanFun API Server running on port ${PORT}`);
  });
}

startServer();