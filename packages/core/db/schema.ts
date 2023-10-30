import { date, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: varchar("id"),
    teamId: varchar("team_id"),
    birthday: date("birthday", { mode: "date" }),
  },
  (t) => ({
    pk: primaryKey(t.id, t.teamId),
  }),
);

export const testItems = pgTable("testItems", {
  id: varchar("id").primaryKey(),
  payload: varchar("payload"),
});
