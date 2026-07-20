import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  integer,
  date,
  boolean,
} from "drizzle-orm/pg-core"

export const userAuthMethodEnum = pgEnum("user_auth_method", [
  "email",
  "google",
])

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "read-only",
])
export const userRoleEnum = pgEnum("user_role", ["user", "admin"])
export const userSubscriptionEnum = pgEnum("user_subscription", ["free", "pro"])

export const users = pgTable("users", {
  serial: serial("serial").primaryKey(),
  id: uuid("id").defaultRandom().notNull().unique(),
  providerId: text("provider_id"),
  name: text("name").notNull(),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerifiedAt: timestamp("email_verified_at"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().notNull(),
  authMethod: userAuthMethodEnum("auth_method").default("email"),
  status: userStatusEnum("status").default("active"),
  role: userRoleEnum("role").default("user"),
  subscriptionType: userSubscriptionEnum("subscription_type").default("free"),
})

// Daily words table - one word per day for all users
export const dailyWords = pgTable("daily_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  definition: text("definition").notNull(),
  pronunciation: text("pronunciation").notNull(),
  examples: text("examples").notNull(), // JSON string of examples array
  date: date("date").notNull().unique(), // The date this word is featured
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// User streaks table - tracks daily learning streaks
export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastCompletedDate: date("last_completed_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Saved words table - user's saved words
export const savedWords = pgTable("saved_words", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dailyWordId: integer("daily_word_id")
    .notNull()
    .references(() => dailyWords.id, { onDelete: "cascade" }),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
})

// User daily completions - tracks which days a user has completed
export const userDailyCompletions = pgTable("user_daily_completions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dailyWordId: integer("daily_word_id")
    .notNull()
    .references(() => dailyWords.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  date: date("date").notNull(),
})

// Learned words - tracks words the user has marked as learned
export const learnedWords = pgTable("learned_words", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dailyWordId: integer("daily_word_id")
    .notNull()
    .references(() => dailyWords.id, { onDelete: "cascade" }),
  learnedAt: timestamp("learned_at").defaultNow().notNull(),
})

export const coachConversations = pgTable("coach_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const coachMessages = pgTable("coach_messages", {
  id: serial("id").primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => coachConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
