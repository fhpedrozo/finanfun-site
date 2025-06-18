// FinanFun Unified Server - Frontend + API
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
async function testDB() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database tables
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
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        birth_date TIMESTAMP,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT DEFAULT 'Brazil',
        preferred_language TEXT DEFAULT 'pt-BR',
        notification_preferences TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        account_type TEXT NOT NULL,
        balance DECIMAL(10,2) DEFAULT 0.00,
        currency TEXT DEFAULT 'BRL',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bitfun_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        transaction_type TEXT NOT NULL,
        description TEXT,
        source TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
}

// API Routes
app.post('/api/auth/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, password, provider, provider_id } = req.body;

    // Check if user exists
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    await client.query('BEGIN');

    // Hash password if provided
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

    // Create user profile
    await client.query(
      'INSERT INTO user_profiles (user_id, country, preferred_language) VALUES ($1, $2, $3)',
      [user.id, 'Brazil', 'pt-BR']
    );

    // Create accounts
    await client.query(
      `INSERT INTO accounts (user_id, account_type, balance, currency)
       VALUES ($1, 'real', 0.00, 'BRL'), ($1, 'virtual', 100.00, 'BitFun')`,
      [user.id]
    );

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
    
    await client.query(
      'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address) VALUES ($1, $2, $3, $4)',
      [user.id, sessionToken, expiresAt, req.ip]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      user,
      session_token: sessionToken
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, uuid, email, name, password_hash, provider, avatar_url, is_verified, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    if (!user.password_hash || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
    
    await pool.query(
      'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address) VALUES ($1, $2, $3, $4)',
      [user.id, sessionToken, expiresAt, req.ip]
    );

    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      session_token: sessionToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const { session_token } = req.body;
    
    if (session_token) {
      await pool.query('DELETE FROM user_sessions WHERE session_token = $1', [session_token]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/health', async (req, res) => {
  const dbConnected = await testDB();
  const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
  
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    users: parseInt(userCount.rows[0].count),
    timestamp: new Date().toISOString()
  });
});

// Serve static files (HTML, CSS, JS)
app.use(express.static('.'));

// Catch-all handler for SPA routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize and start server
async function startServer() {
  await initDB();
  const dbConnected = await testDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FinanFun server running on port ${PORT}`);
    console.log(`📊 Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
    console.log(`🌐 Access the app at: http://localhost:${PORT}`);
  });
}

startServer();