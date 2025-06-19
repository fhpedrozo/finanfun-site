import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").default("parent"), // 'parent', 'child'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles - extended information for FinanFun
export const userProfiles = pgTable('user_profiles', {
  id: integer('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id).notNull(),
  birthDate: timestamp('birth_date'),
  phone: varchar('phone'),
  address: text('address'),
  city: varchar('city'),
  state: varchar('state'),
  country: varchar('country').default('Brazil'),
  preferredLanguage: varchar('preferred_language').default('pt-BR'),
  notificationPreferences: jsonb('notification_preferences'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Family connections - link parents to children
export const familyConnections = pgTable('family_connections', {
  id: integer('id').primaryKey(),
  parentId: varchar('parent_id').references(() => users.id).notNull(),
  childId: varchar('child_id').references(() => users.id).notNull(),
  relationship: varchar('relationship').default('parent'), // 'parent', 'guardian'
  status: varchar('status').default('active'), // 'active', 'pending', 'inactive'
  createdAt: timestamp('created_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
});

// Accounts - financial accounts for users
export const accounts = pgTable('accounts', {
  id: integer('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id).notNull(),
  accountName: varchar('account_name').notNull(),
  accountType: varchar('account_type').notNull(), // 'real', 'bitfun'
  balance: decimal('balance', { precision: 10, scale: 2 }).default('0.00'),
  currency: varchar('currency').default('BRL'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// BitFun transactions - virtual currency transactions
export const bitfunTransactions = pgTable('bitfun_transactions', {
  id: integer('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: varchar('type').notNull(), // 'earn', 'spend', 'transfer', 'reward'
  description: text('description'),
  source: varchar('source'), // 'task', 'goal', 'parent_transfer', 'achievement'
  metadata: jsonb('metadata'), // Additional data (task_id, goal_id, etc.)
  createdAt: timestamp('created_at').defaultNow(),
});

// Achievements - gamification system
export const achievements = pgTable('achievements', {
  id: integer('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id).notNull(),
  achievementType: varchar('achievement_type').notNull(), // 'first_save', 'goal_completed', etc.
  title: varchar('title').notNull(),
  description: text('description'),
  points: integer('points').default(0),
  badgeIcon: varchar('badge_icon'),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
});

// Learning progress - track educational progress
export const learningProgress = pgTable('learning_progress', {
  id: integer('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id).notNull(),
  module: varchar('module').notNull(), // 'savings', 'investing', 'budgeting'
  lesson: varchar('lesson').notNull(),
  completed: boolean('completed').default(false),
  score: integer('score'),
  timeSpent: integer('time_spent'), // in minutes
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  accounts: many(accounts),
  bitfunTransactions: many(bitfunTransactions),
  achievements: many(achievements),
  learningProgress: many(learningProgress),
  asParent: many(familyConnections, {
    relationName: "parent",
  }),
  asChild: many(familyConnections, {
    relationName: "child",
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const bitfunTransactionsRelations = relations(bitfunTransactions, ({ one }) => ({
  user: one(users, {
    fields: [bitfunTransactions.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export const learningProgressRelations = relations(learningProgress, ({ one }) => ({
  user: one(users, {
    fields: [learningProgress.userId],
    references: [users.id],
  }),
}));

export const familyConnectionsRelations = relations(familyConnections, ({ one }) => ({
  parent: one(users, {
    fields: [familyConnections.parentId],
    references: [users.id],
    relationName: "parent",
  }),
  child: one(users, {
    fields: [familyConnections.childId],
    references: [users.id],
    relationName: "child",
  }),
}));

// Type exports for Replit Auth compatibility
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
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