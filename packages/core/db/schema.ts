import { date, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: varchar("id").notNull(),
    teamId: varchar("team_id").notNull(),
    birthday: date("birthday", { mode: "date" }).notNull(),
  },
  (t) => ({
    pk: primaryKey(t.id, t.teamId),
  }),
);

export const testItems = pgTable("testItems", {
  id: varchar("id").primaryKey().notNull(),
  payload: varchar("payload").notNull(),
});
