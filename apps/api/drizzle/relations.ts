import { relations } from "drizzle-orm/relations";
import { users, learnedWords, dailyWords, savedWords, userDailyCompletions, userStreaks } from "./schema";

export const learnedWordsRelations = relations(learnedWords, ({one}) => ({
	user: one(users, {
		fields: [learnedWords.userId],
		references: [users.id]
	}),
	dailyWord: one(dailyWords, {
		fields: [learnedWords.dailyWordId],
		references: [dailyWords.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	learnedWords: many(learnedWords),
	savedWords: many(savedWords),
	userDailyCompletions: many(userDailyCompletions),
	userStreaks: many(userStreaks),
}));

export const dailyWordsRelations = relations(dailyWords, ({many}) => ({
	learnedWords: many(learnedWords),
	savedWords: many(savedWords),
	userDailyCompletions: many(userDailyCompletions),
}));

export const savedWordsRelations = relations(savedWords, ({one}) => ({
	user: one(users, {
		fields: [savedWords.userId],
		references: [users.id]
	}),
	dailyWord: one(dailyWords, {
		fields: [savedWords.dailyWordId],
		references: [dailyWords.id]
	}),
}));

export const userDailyCompletionsRelations = relations(userDailyCompletions, ({one}) => ({
	user: one(users, {
		fields: [userDailyCompletions.userId],
		references: [users.id]
	}),
	dailyWord: one(dailyWords, {
		fields: [userDailyCompletions.dailyWordId],
		references: [dailyWords.id]
	}),
}));

export const userStreaksRelations = relations(userStreaks, ({one}) => ({
	user: one(users, {
		fields: [userStreaks.userId],
		references: [users.id]
	}),
}));