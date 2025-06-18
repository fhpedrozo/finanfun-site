// FinanFun User Storage Layer
// Manages user data with PostgreSQL database

const { query, getClient } = require('./db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Interface for user storage operations
class IStorage {
  async getUser(id) { throw new Error('Not implemented'); }
  async getUserByEmail(email) { throw new Error('Not implemented'); }
  async createUser(userData) { throw new Error('Not implemented'); }
  async updateUser(id, userData) { throw new Error('Not implemented'); }
  async deleteUser(id) { throw new Error('Not implemented'); }
  async createSession(userId, sessionData) { throw new Error('Not implemented'); }
  async getSession(token) { throw new Error('Not implemented'); }
  async deleteSession(token) { throw new Error('Not implemented'); }
}

// Database storage implementation
class DatabaseStorage extends IStorage {
  constructor() {
    super();
    this.initDatabase();
  }

  async initDatabase() {
    try {
      // Create tables if they don't exist
      await this.createTables();
      console.log('✅ Database tables initialized');
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
    }
  }

  async createTables() {
    const createUsersTable = `
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
    `;

    const createUserProfilesTable = `
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
    `;

    const createUserSessionsTable = `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    const createAccountsTable = `
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
    `;

    const createBitfunTransactionsTable = `
      CREATE TABLE IF NOT EXISTS bitfun_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        transaction_type TEXT NOT NULL,
        description TEXT,
        source TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await query(createUsersTable);
    await query(createUserProfilesTable);
    await query(createUserSessionsTable);
    await query(createAccountsTable);
    await query(createBitfunTransactionsTable);
  }

  async getUser(id) {
    try {
      const result = await query(
        `SELECT u.*, p.birth_date, p.phone, p.city, p.state, p.country, p.preferred_language
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE u.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const result = await query(
        `SELECT u.*, p.birth_date, p.phone, p.city, p.state, p.country, p.preferred_language
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE u.email = $1`,
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async createUser(userData) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Hash password if provided
      let passwordHash = null;
      if (userData.password) {
        passwordHash = await bcrypt.hash(userData.password, 10);
      }

      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, name, password_hash, provider, provider_id, avatar_url, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userData.email,
          userData.name,
          passwordHash,
          userData.provider || 'email',
          userData.provider_id || null,
          userData.avatar_url || null,
          userData.role || 'user'
        ]
      );

      const user = userResult.rows[0];

      // Create user profile
      await client.query(
        `INSERT INTO user_profiles (user_id, country, preferred_language)
         VALUES ($1, $2, $3)`,
        [user.id, 'Brazil', 'pt-BR']
      );

      // Create default accounts
      await client.query(
        `INSERT INTO accounts (user_id, account_type, balance, currency)
         VALUES ($1, 'real', 0.00, 'BRL'), ($1, 'virtual', 100.00, 'BitFun')`,
        [user.id]
      );

      await client.query('COMMIT');
      
      // Return user without sensitive data
      const { password_hash, ...safeUser } = user;
      return safeUser;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateUser(id, userData) {
    try {
      const setClause = [];
      const values = [];
      let paramCounter = 1;

      // Build dynamic update query
      if (userData.name) {
        setClause.push(`name = $${paramCounter}`);
        values.push(userData.name);
        paramCounter++;
      }
      if (userData.email) {
        setClause.push(`email = $${paramCounter}`);
        values.push(userData.email);
        paramCounter++;
      }
      if (userData.avatar_url !== undefined) {
        setClause.push(`avatar_url = $${paramCounter}`);
        values.push(userData.avatar_url);
        paramCounter++;
      }
      if (userData.is_verified !== undefined) {
        setClause.push(`is_verified = $${paramCounter}`);
        values.push(userData.is_verified);
        paramCounter++;
      }

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      const result = await query(
        `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
        values
      );

      if (result.rows[0]) {
        const { password_hash, ...safeUser } = result.rows[0];
        return safeUser;
      }
      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      // Delete related data first
      await client.query('DELETE FROM user_sessions WHERE user_id = $1', [id]);
      await client.query('DELETE FROM bitfun_transactions WHERE user_id = $1', [id]);
      await client.query('DELETE FROM accounts WHERE user_id = $1', [id]);
      await client.query('DELETE FROM user_profiles WHERE user_id = $1', [id]);
      
      // Delete user
      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      
      await client.query('COMMIT');
      return result.rows[0] || null;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async createSession(userId, sessionData) {
    try {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days

      const result = await query(
        `INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, sessionToken, expiresAt, sessionData.ip_address, sessionData.user_agent]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async getSession(token) {
    try {
      const result = await query(
        `SELECT s.*, u.id as user_id, u.email, u.name, u.role
         FROM user_sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.session_token = $1 AND s.expires_at > NOW()`,
        [token]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  async deleteSession(token) {
    try {
      const result = await query(
        'DELETE FROM user_sessions WHERE session_token = $1 RETURNING *',
        [token]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  async authenticateUser(email, password) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user || !user.password_hash) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return null;
      }

      // Update last login
      await query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      const { password_hash, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  async getUserAccounts(userId) {
    try {
      const result = await query(
        'SELECT * FROM accounts WHERE user_id = $1 AND is_active = TRUE',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting user accounts:', error);
      throw error;
    }
  }

  async addBitfunTransaction(userId, amount, type, description, source) {
    try {
      const result = await query(
        `INSERT INTO bitfun_transactions (user_id, amount, transaction_type, description, source)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, amount, type, description, source]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error adding BitFun transaction:', error);
      throw error;
    }
  }
}

// In-memory storage for fallback (temporary)
class MemStorage extends IStorage {
  constructor() {
    super();
    this.users = new Map();
    this.sessions = new Map();
    this.nextId = 1;
  }

  async getUser(id) {
    return this.users.get(parseInt(id)) || null;
  }

  async getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async createUser(userData) {
    const user = {
      id: this.nextId++,
      uuid: crypto.randomUUID(),
      email: userData.email,
      name: userData.name,
      provider: userData.provider || 'email',
      avatar_url: userData.avatar_url || null,
      is_verified: false,
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    };

    if (userData.password) {
      user.password_hash = await bcrypt.hash(userData.password, 10);
    }

    this.users.set(user.id, user);
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(id, userData) {
    const user = this.users.get(parseInt(id));
    if (!user) return null;

    Object.assign(user, userData, { updated_at: new Date() });
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async deleteUser(id) {
    return this.users.delete(parseInt(id));
  }

  async createSession(userId, sessionData) {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const session = {
      id: this.nextId++,
      user_id: parseInt(userId),
      session_token: sessionToken,
      expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
      created_at: new Date(),
      ...sessionData
    };

    this.sessions.set(sessionToken, session);
    return session;
  }

  async getSession(token) {
    const session = this.sessions.get(token);
    if (!session || session.expires_at < new Date()) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }

  async deleteSession(token) {
    return this.sessions.delete(token);
  }

  async authenticateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password_hash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}

// Export the storage implementation
const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();

module.exports = {
  storage,
  IStorage,
  DatabaseStorage,
  MemStorage
};