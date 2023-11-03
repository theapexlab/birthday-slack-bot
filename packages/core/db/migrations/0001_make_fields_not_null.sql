ALTER TABLE "testItems" ALTER COLUMN "payload" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "team_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "birthday" SET NOT NULL;