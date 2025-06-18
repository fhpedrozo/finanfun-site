// FinanFun Server with PostgreSQL Integration
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Test database connection
async function testDB() {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

// Auth routes
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
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Database status check
app.get('/api/db/status', async (req, res) => {
  try {
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    
    res.json({
      status: 'connected',
      tables: tables.rows.map(row => row.table_name),
      user_count: parseInt(userCount.rows[0].count),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Initialize and start server
async function startServer() {
  const dbConnected = await testDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinanFun API Server running on port ${PORT}`);
    console.log(`Database status: ${dbConnected ? 'Connected' : 'Disconnected'}`);
  });
}

startServer();