import { pgTable, unique, serial, uuid, text, timestamp, foreignKey, integer, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const userAuthMethod = pgEnum("user_auth_method", ['email', 'google'])
export const userRole = pgEnum("user_role", ['user', 'admin'])
export const userStatus = pgEnum("user_status", ['active', 'suspended', 'read-only'])
export const userSubscription = pgEnum("user_subscription", ['free', 'pro'])


export const users = pgTable("users", {
	serial: serial().primaryKey().notNull(),
	id: uuid().defaultRandom().notNull(),
	providerId: text("provider_id"),
	name: text().notNull(),
	username: text(),
	email: text().notNull(),
	password: text(),
	emailVerifiedAt: timestamp("email_verified_at", { mode: 'string' }),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	authMethod: userAuthMethod("auth_method").default('email'),
	status: userStatus().default('active'),
	role: userRole().default('user'),
	subscriptionType: userSubscription("subscription_type").default('free'),
}, (table) => [
	unique("users_id_unique").on(table.id),
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const learnedWords = pgTable("learned_words", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	dailyWordId: integer("daily_word_id").notNull(),
	learnedAt: timestamp("learned_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "learned_words_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dailyWordId],
			foreignColumns: [dailyWords.id],
			name: "learned_words_daily_word_id_daily_words_id_fk"
		}).onDelete("cascade"),
]);

export const dailyWords = pgTable("daily_words", {
	id: serial().primaryKey().notNull(),
	word: text().notNull(),
	definition: text().notNull(),
	pronunciation: text().notNull(),
	examples: text().notNull(),
	date: date().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("daily_words_date_unique").on(table.date),
]);

export const savedWords = pgTable("saved_words", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	dailyWordId: integer("daily_word_id").notNull(),
	savedAt: timestamp("saved_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_words_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dailyWordId],
			foreignColumns: [dailyWords.id],
			name: "saved_words_daily_word_id_daily_words_id_fk"
		}).onDelete("cascade"),
]);

export const userDailyCompletions = pgTable("user_daily_completions", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	dailyWordId: integer("daily_word_id").notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }).defaultNow().notNull(),
	date: date().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_daily_completions_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dailyWordId],
			foreignColumns: [dailyWords.id],
			name: "user_daily_completions_daily_word_id_daily_words_id_fk"
		}).onDelete("cascade"),
]);

export const userStreaks = pgTable("user_streaks", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	currentStreak: integer("current_streak").default(0).notNull(),
	longestStreak: integer("longest_streak").default(0).notNull(),
	lastCompletedDate: date("last_completed_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_streaks_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
