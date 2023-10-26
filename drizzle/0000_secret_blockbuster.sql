CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar,
	"team_id" varchar,
	"birthday" date,
	CONSTRAINT users_id_team_id PRIMARY KEY("id","team_id")
);
