ALTER TABLE "iceBreakerThreads" RENAME TO "ice_breaker_threads";--> statement-breakpoint
ALTER TABLE "presentIdeas" RENAME TO "present_ideas";--> statement-breakpoint
ALTER TABLE "squadJoins" RENAME TO "squad_joins";--> statement-breakpoint
ALTER TABLE "testItems" RENAME TO "test_items";--> statement-breakpoint
ALTER TABLE "squad_joins" DROP CONSTRAINT "squadJoins_birthday_person_user_id_team_id_unique";--> statement-breakpoint
ALTER TABLE "ice_breaker_threads" DROP CONSTRAINT "iceBreakerThreads_user_id_team_id_users_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "present_ideas" DROP CONSTRAINT "presentIdeas_user_id_team_id_users_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "present_ideas" DROP CONSTRAINT "presentIdeas_birthday_person_team_id_users_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "squad_joins" DROP CONSTRAINT "squadJoins_user_id_team_id_users_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "squad_joins" DROP CONSTRAINT "squadJoins_birthday_person_team_id_users_id_team_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ice_breaker_threads" ADD CONSTRAINT "ice_breaker_threads_user_id_team_id_users_id_team_id_fk" FOREIGN KEY ("user_id","team_id") REFERENCES "users"("id","team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "present_ideas" ADD CONSTRAINT "present_ideas_user_id_team_id_users_id_team_id_fk" FOREIGN KEY ("user_id","team_id") REFERENCES "users"("id","team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "present_ideas" ADD CONSTRAINT "present_ideas_birthday_person_team_id_users_id_team_id_fk" FOREIGN KEY ("birthday_person","team_id") REFERENCES "users"("id","team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "squad_joins" ADD CONSTRAINT "squad_joins_user_id_team_id_users_id_team_id_fk" FOREIGN KEY ("user_id","team_id") REFERENCES "users"("id","team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "squad_joins" ADD CONSTRAINT "squad_joins_birthday_person_team_id_users_id_team_id_fk" FOREIGN KEY ("birthday_person","team_id") REFERENCES "users"("id","team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "squad_joins" ADD CONSTRAINT "squad_joins_birthday_person_user_id_team_id_unique" UNIQUE("birthday_person","user_id","team_id");