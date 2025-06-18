// FinanFun Backend Server
// Express server with PostgreSQL integration

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./db');
const { storage } = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Test database connection on startup
testConnection();

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, provider, provider_id } = req.body;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const userData = { name, email, password, provider, provider_id };
    const user = await storage.createUser(userData);

    // Create session
    const session = await storage.createSession(user.id, {
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      user,
      session_token: session.session_token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Authenticate user
    const user = await storage.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const session = await storage.createSession(user.id, {
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      user,
      session_token: session.session_token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const { session_token } = req.body;

    if (session_token) {
      await storage.deleteSession(session_token);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const session = await storage.getSession(token);

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await storage.getUser(session.user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User account routes
app.get('/api/users/:id/accounts', async (req, res) => {
  try {
    const { id } = req.params;
    const accounts = await storage.getUserAccounts(id);
    res.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users/:id/bitfun', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, description, source } = req.body;
    
    const transaction = await storage.addBitfunTransaction(id, amount, type, description, source);
    res.json({ transaction });
  } catch (error) {
    console.error('BitFun transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Serve static files for frontend
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FinanFun server running on port ${PORT}`);
  console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});