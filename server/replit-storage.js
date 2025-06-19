const { pool } = require('./db.js');

// Interface for storage operations compatible with Replit Auth
class ReplitStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async upsertUser(userData) {
    try {
      const { id, email, firstName, lastName, profileImageUrl } = userData;
      const result = await pool.query(`
        INSERT INTO users (id, email, first_name, last_name, profile_image_url, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          profile_image_url = EXCLUDED.profile_image_url,
          updated_at = NOW()
        RETURNING *
      `, [id, email, firstName, lastName, profileImageUrl]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  // Initialize required tables for Replit Auth
  async initializeTables() {
    try {
      // Sessions table for express-session with connect-pg-simple
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR NOT NULL COLLATE "default",
          sess JSON NOT NULL,
          expire TIMESTAMP(6) NOT NULL
        )
        WITH (OIDS=FALSE);
        
        CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
      `);

      // Users table compatible with Replit Auth
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY,
          email VARCHAR UNIQUE,
          first_name VARCHAR,
          last_name VARCHAR,
          profile_image_url VARCHAR,
          user_type VARCHAR DEFAULT 'parent',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // User profiles for extended information
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR REFERENCES users(id),
          birth_date TIMESTAMP,
          phone VARCHAR,
          address TEXT,
          city VARCHAR,
          state VARCHAR,
          country VARCHAR DEFAULT 'Brazil',
          preferred_language VARCHAR DEFAULT 'pt-BR',
          notification_preferences JSON,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Family connections
      await pool.query(`
        CREATE TABLE IF NOT EXISTS family_connections (
          id SERIAL PRIMARY KEY,
          parent_id VARCHAR REFERENCES users(id),
          child_id VARCHAR REFERENCES users(id),
          relationship VARCHAR DEFAULT 'parent',
          status VARCHAR DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          approved_at TIMESTAMP
        );
      `);

      // Accounts for financial data
      await pool.query(`
        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR REFERENCES users(id),
          account_name VARCHAR NOT NULL,
          account_type VARCHAR NOT NULL,
          balance DECIMAL(10,2) DEFAULT 0.00,
          currency VARCHAR DEFAULT 'BRL',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // BitFun transactions
      await pool.query(`
        CREATE TABLE IF NOT EXISTS bitfun_transactions (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR REFERENCES users(id),
          amount DECIMAL(10,2) NOT NULL,
          type VARCHAR NOT NULL,
          description TEXT,
          source VARCHAR,
          metadata JSON,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Achievements
      await pool.query(`
        CREATE TABLE IF NOT EXISTS achievements (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR REFERENCES users(id),
          achievement_type VARCHAR NOT NULL,
          title VARCHAR NOT NULL,
          description TEXT,
          points INTEGER DEFAULT 0,
          badge_icon VARCHAR,
          unlocked_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Learning progress
      await pool.query(`
        CREATE TABLE IF NOT EXISTS learning_progress (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR REFERENCES users(id),
          module VARCHAR NOT NULL,
          lesson VARCHAR NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          score INTEGER,
          time_spent INTEGER,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      console.log('All Replit Auth tables initialized successfully');
    } catch (error) {
      console.error('Error initializing tables:', error);
      throw error;
    }
  }

  // Additional methods for FinanFun functionality
  async getUserAccounts(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM accounts WHERE user_id = $1 AND is_active = true ORDER BY created_at',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting user accounts:', error);
      return [];
    }
  }

  async addBitfunTransaction(userId, amount, type, description, source = null) {
    try {
      const result = await pool.query(`
        INSERT INTO bitfun_transactions (user_id, amount, type, description, source)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [userId, amount, type, description, source]);
      return result.rows[0];
    } catch (error) {
      console.error('Error adding BitFun transaction:', error);
      throw error;
    }
  }

  async getUserFamily(userId) {
    try {
      const result = await pool.query(`
        SELECT 
          fc.*,
          u_child.id as child_id,
          u_child.first_name as child_first_name,
          u_child.last_name as child_last_name,
          u_child.profile_image_url as child_avatar
        FROM family_connections fc
        JOIN users u_child ON fc.child_id = u_child.id
        WHERE fc.parent_id = $1 AND fc.status = 'active'
        ORDER BY u_child.first_name
      `, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting user family:', error);
      return [];
    }
  }
}

const storage = new ReplitStorage();

module.exports = {
  ReplitStorage,
  storage
};