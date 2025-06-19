// FinanFun Database Schema
// User management and authentication tables

import { pgTable, serial, text, timestamp, boolean, decimal, integer, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - stores user authentication and profile data
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().unique().notNull(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  password_hash: text('password_hash'), // For email/password auth
  provider: text('provider'), // 'email', 'google', 'facebook'
  provider_id: text('provider_id'), // External provider user ID
  avatar_url: text('avatar_url'),
  is_verified: boolean('is_verified').default(false),
  role: text('role').default('user'), // 'user', 'parent', 'admin'
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  last_login: timestamp('last_login'),
});

// User profiles - extended user information
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  birth_date: timestamp('birth_date'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country').default('Brazil'),
  preferred_language: text('preferred_language').default('pt-BR'),
  notification_preferences: text('notification_preferences'), // JSON string
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Family connections - link parents to children
export const familyConnections = pgTable('family_connections', {
  id: serial('id').primaryKey(),
  parent_id: integer('parent_id').references(() => users.id).notNull(),
  child_id: integer('child_id').references(() => users.id).notNull(),
  relationship: text('relationship').default('parent'), // 'parent', 'guardian'
  status: text('status').default('active'), // 'active', 'pending', 'inactive'
  created_at: timestamp('created_at').defaultNow(),
  approved_at: timestamp('approved_at'),
});

// User sessions - track active sessions
export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  session_token: text('session_token').unique().notNull(),
  expires_at: timestamp('expires_at').notNull(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
});

// Financial accounts - user wallets and balances
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  account_type: text('account_type').notNull(), // 'real', 'virtual', 'savings'
  balance: decimal('balance', { precision: 10, scale: 2 }).default('0.00'),
  currency: text('currency').default('BRL'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// BitFun virtual currency
export const bitfunTransactions = pgTable('bitfun_transactions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  transaction_type: text('transaction_type').notNull(), // 'earn', 'spend', 'reward'
  description: text('description'),
  source: text('source'), // 'task', 'reward', 'purchase', 'transfer'
  created_at: timestamp('created_at').defaultNow(),
});

// User achievements and progress
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  achievement_type: text('achievement_type').notNull(), // 'first_login', 'first_save', etc.
  title: text('title').notNull(),
  description: text('description'),
  badge_icon: text('badge_icon'),
  points_earned: integer('points_earned').default(0),
  unlocked_at: timestamp('unlocked_at').defaultNow(),
});

// Learning progress tracking
export const learningProgress = pgTable('learning_progress', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  module: text('module').notNull(), // 'savings', 'investment', 'budgeting'
  lesson: text('lesson').notNull(),
  status: text('status').default('not_started'), // 'not_started', 'in_progress', 'completed'
  score: integer('score'), // Percentage score
  time_spent: integer('time_spent'), // Minutes
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.user_id],
  }),
  accounts: many(accounts),
  bitfunTransactions: many(bitfunTransactions),
  achievements: many(achievements),
  learningProgress: many(learningProgress),
  sessions: many(userSessions),
  parentConnections: many(familyConnections, { relationName: 'parent' }),
  childConnections: many(familyConnections, { relationName: 'child' }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.user_id],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.user_id],
    references: [users.id],
  }),
}));

export const bitfunTransactionsRelations = relations(bitfunTransactions, ({ one }) => ({
  user: one(users, {
    fields: [bitfunTransactions.user_id],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.user_id],
    references: [users.id],
  }),
}));

export const learningProgressRelations = relations(learningProgress, ({ one }) => ({
  user: one(users, {
    fields: [learningProgress.user_id],
    references: [users.id],
  }),
}));

export const familyConnectionsRelations = relations(familyConnections, ({ one }) => ({
  parent: one(users, {
    fields: [familyConnections.parent_id],
    references: [users.id],
    relationName: 'parent',
  }),
  child: one(users, {
    fields: [familyConnections.child_id],
    references: [users.id],
    relationName: 'child',
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.user_id],
    references: [users.id],
  }),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
export type BitfunTransaction = typeof bitfunTransactions.$inferSelect;
export type InsertBitfunTransaction = typeof bitfunTransactions.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type InsertLearningProgress = typeof learningProgress.$inferInsert;
export type FamilyConnection = typeof familyConnections.$inferSelect;
export type InsertFamilyConnection = typeof familyConnections.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;