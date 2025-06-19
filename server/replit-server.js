import express from 'express';
import cors from 'cors';
import { setupAuth, isAuthenticated } from './replit-auth.js';
import { storage } from './replit-storage.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '..')));

// Initialize database tables
async function initializeDatabase() {
  try {
    await storage.initializeTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Set up authentication
async function startServer() {
  try {
    await initializeDatabase();
    await setupAuth(app);

    // Auth routes
    app.get('/api/auth/user', isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    });

    // Dashboard routes
    app.get('/api/dashboard/parent', isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        const accounts = await storage.getUserAccounts(userId);
        const family = await storage.getUserFamily(userId);
        
        res.json({
          user,
          accounts,
          family,
          dashboardType: 'parent'
        });
      } catch (error) {
        console.error("Error fetching parent dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
      }
    });

    app.get('/api/dashboard/child', isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        const accounts = await storage.getUserAccounts(userId);
        
        res.json({
          user,
          accounts,
          dashboardType: 'child'
        });
      } catch (error) {
        console.error("Error fetching child dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
      }
    });

    // BitFun transaction endpoints
    app.post('/api/bitfun/transaction', isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.claims.sub;
        const { amount, type, description, source } = req.body;
        
        const transaction = await storage.addBitfunTransaction(
          userId, amount, type, description, source
        );
        
        res.json(transaction);
      } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Failed to create transaction" });
      }
    });

    // Dashboard pages
    app.get('/dashboard/parent', isAuthenticated, (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'pages', 'parent-dashboard.html'));
    });

    app.get('/dashboard/child', isAuthenticated, (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'pages', 'child-dashboard.html'));
    });

    // Main landing page
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'index.html'));
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`FinanFun Replit Auth Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();