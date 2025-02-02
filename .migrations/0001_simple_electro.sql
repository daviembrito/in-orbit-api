CREATE TABLE IF NOT EXISTS "goal_completion" (
	"id" text PRIMARY KEY NOT NULL,
	"goal_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_completion" ADD CONSTRAINT "goal_completion_goal_id_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goal"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
