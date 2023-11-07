CREATE TABLE IF NOT EXISTS "presentIdeas" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" varchar NOT NULL,
	"birthday_person" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"present_idea" varchar NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presentIdeas" ADD CONSTRAINT "presentIdeas_user_id_team_id_users_id_team_id_fk" FOREIGN KEY ("user_id","team_id") REFERENCES "users"("id","team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presentIdeas" ADD CONSTRAINT "presentIdeas_birthday_person_team_id_users_id_team_id_fk" FOREIGN KEY ("birthday_person","team_id") REFERENCES "users"("id","team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
