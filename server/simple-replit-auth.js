const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectPg = require('connect-pg-simple');
const { pool } = require('./db.js');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'https://localhost:5000', 'http://0.0.0.0:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  ttl: sessionTtl,
  tableName: 'session'
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'finanfun-dev-secret-2025',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: sessionTtl,
  },
}));

// Initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        user_type VARCHAR DEFAULT 'parent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
        display_name VARCHAR,
        age INTEGER,
        avatar_url VARCHAR,
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
        account_type VARCHAR NOT NULL,
        balance DECIMAL(10,2) DEFAULT 0.00,
        currency VARCHAR DEFAULT 'BRL',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bitfun_transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        transaction_type VARCHAR NOT NULL,
        description TEXT,
        source VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

// Mock Replit Auth endpoints (for development)
app.post('/api/auth/mock-login', async (req, res) => {
  try {
    const { email, userType = 'parent' } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate mock user ID
    const userId = 'mock_' + Date.now();
    
    // Create or update user in database
    const result = await pool.query(`
      INSERT INTO users (email, name, provider, avatar_url, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        last_login = CURRENT_TIMESTAMP
      RETURNING *
    `, [email, 'Mock User', 'mock', 'https://via.placeholder.com/150', userType]);
    
    const user = result.rows[0];

    // Create user session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      userType: user.role || userType
    };

    res.json({ 
      message: 'Logged in successfully',
      user: req.session.user,
      session_token: req.session.id
    });
  } catch (error) {
    console.error('Mock login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/user', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profileImageUrl: user.profile_image_url,
      userType: user.user_type
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Dashboard data endpoints
app.get('/api/dashboard/parent', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get user accounts
    const accountsResult = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1',
      [userId]
    );

    // Get recent transactions
    const transactionsResult = await pool.query(
      'SELECT * FROM bitfun_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    res.json({
      accounts: accountsResult.rows,
      recentTransactions: transactionsResult.rows,
      totalBalance: accountsResult.rows.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0),
      childrenCount: 0, // Mock data for now
      activeGoals: 2, // Mock data
      completedTasks: 5 // Mock data
    });
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

app.get('/api/dashboard/child', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get user accounts
    const accountsResult = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1',
      [userId]
    );

    // Get recent transactions
    const transactionsResult = await pool.query(
      'SELECT * FROM bitfun_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    res.json({
      bitfunBalance: accountsResult.rows.find(acc => acc.account_type === 'bitfun')?.balance || 0,
      realBalance: accountsResult.rows.find(acc => acc.account_type === 'real')?.balance || 0,
      recentTransactions: transactionsResult.rows,
      activeTasks: [], // Mock data
      achievements: [], // Mock data
      learningProgress: 45 // Mock data
    });
  } catch (error) {
    console.error('Error fetching child dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Serve static files
app.use(express.static('.'));

// Serve dashboard pages
app.get('/parent-dashboard', isAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/../pages/parent-dashboard.html');
});

app.get('/child-dashboard', isAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/../pages/child-dashboard.html');
});

async function startServer() {
  try {
    await initializeDatabase();
    
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`FinanFun Replit Auth Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, isAuthenticated };