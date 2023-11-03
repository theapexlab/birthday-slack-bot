CREATE TABLE IF NOT EXISTS "iceBreakerThreads" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"thread_id" varchar NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iceBreakerThreads" ADD CONSTRAINT "iceBreakerThreads_user_id_team_id_users_id_team_id_fk" FOREIGN KEY ("user_id","team_id") REFERENCES "users"("id","team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
