CREATE TABLE "daily_words" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" text NOT NULL,
	"definition" text NOT NULL,
	"pronunciation" text NOT NULL,
	"examples" text NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_words_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "learned_words" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_word_id" integer NOT NULL,
	"learned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_words" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_word_id" integer NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_daily_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_word_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_completed_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "learned_words" ADD CONSTRAINT "learned_words_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learned_words" ADD CONSTRAINT "learned_words_daily_word_id_daily_words_id_fk" FOREIGN KEY ("daily_word_id") REFERENCES "public"."daily_words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_words" ADD CONSTRAINT "saved_words_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_words" ADD CONSTRAINT "saved_words_daily_word_id_daily_words_id_fk" FOREIGN KEY ("daily_word_id") REFERENCES "public"."daily_words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_completions" ADD CONSTRAINT "user_daily_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_completions" ADD CONSTRAINT "user_daily_completions_daily_word_id_daily_words_id_fk" FOREIGN KEY ("daily_word_id") REFERENCES "public"."daily_words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;