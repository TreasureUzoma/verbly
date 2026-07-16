CREATE TYPE "public"."user_auth_method" AS ENUM('email', 'google');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'read-only');--> statement-breakpoint
CREATE TYPE "public"."user_subscription" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TABLE "users" (
	"serial" serial PRIMARY KEY NOT NULL,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" text,
	"name" text NOT NULL,
	"username" text,
	"email" text NOT NULL,
	"password" text,
	"email_verified_at" timestamp,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"auth_method" "user_auth_method" DEFAULT 'email',
	"status" "user_status" DEFAULT 'active',
	"role" "user_role" DEFAULT 'user',
	"subscription_type" "user_subscription" DEFAULT 'free',
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
