DO $$ BEGIN
 CREATE TYPE "history_action" AS ENUM('ADD_POST', 'VIEW_POST', 'EDIT_POST', 'REMOVE_POST', 'ADD_COMMENT', 'EDIT_COMMENT', 'REMOVE_COMMENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "history_os" AS ENUM('Android', 'iOS', 'iPadOS', 'macOS', 'Windows', 'Linux', 'Other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "content_type" AS ENUM('text', 'image', 'video', 'file', 'html');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"post_id" integer NOT NULL,
	"content" text NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"ip" text NOT NULL,
	"device_id" uuid NOT NULL,
	"os" "history_os" NOT NULL,
	"user_id" text,
	"post_id" integer NOT NULL,
	"comment_id" uuid,
	"action" "history_action" NOT NULL,
	"todayFirstSeen" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"desc" text NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" integer NOT NULL,
	"index" integer NOT NULL,
	"type" "content_type" NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_tag" (
	"post_id" integer NOT NULL,
	"tag_name" text NOT NULL,
	CONSTRAINT "post_tag_post_id_tag_name_pk" PRIMARY KEY("post_id","tag_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"owner" boolean DEFAULT false NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"picture" text NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag" (
	"name" text PRIMARY KEY NOT NULL,
	"color_text_light" text NOT NULL,
	"color_text_dark" text NOT NULL,
	"color_bg_light" text NOT NULL,
	"color_bg_dark" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "history" ADD CONSTRAINT "history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "history" ADD CONSTRAINT "history_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "history" ADD CONSTRAINT "history_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post" ADD CONSTRAINT "post_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_content" ADD CONSTRAINT "post_content_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_tag" ADD CONSTRAINT "post_tag_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_tag" ADD CONSTRAINT "post_tag_tag_name_tag_name_fk" FOREIGN KEY ("tag_name") REFERENCES "tag"("name") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
