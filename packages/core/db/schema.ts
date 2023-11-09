import {
  date,
  foreignKey,
  pgTable,
  primaryKey,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: varchar("id").notNull(),
    teamId: varchar("team_id").notNull(),
    birthday: date("birthday", { mode: "date" }),
  },
  (t) => ({
    pk: primaryKey(t.id, t.teamId),
  }),
);

export const iceBreakerThreads = pgTable(
  "iceBreakerThreads",
  {
    id: serial("id").primaryKey().notNull(),
    teamId: varchar("team_id").notNull(),
    userId: varchar("user_id").notNull(),
    threadId: varchar("thread_id").notNull(),
  },
  (t) => ({
    userReference: foreignKey({
      columns: [t.userId, t.teamId],
      foreignColumns: [users.id, users.teamId],
    }).onDelete("cascade"),
  }),
);

export const presentIdeas = pgTable(
  "presentIdeas",
  {
    id: serial("id").primaryKey().notNull(),
    teamId: varchar("team_id").notNull(),
    birthdayPerson: varchar("birthday_person").notNull(),
    userId: varchar("user_id").notNull(),
    presentIdea: varchar("present_idea").notNull(),
  },
  (t) => ({
    userReference: foreignKey({
      columns: [t.userId, t.teamId],
      foreignColumns: [users.id, users.teamId],
    }).onDelete("cascade"),
    birthdayPersonReference: foreignKey({
      columns: [t.birthdayPerson, t.teamId],
      foreignColumns: [users.id, users.teamId],
    }).onDelete("cascade"),
  }),
);

export type PresentIdea = typeof presentIdeas.$inferInsert;

export const testItems = pgTable("testItems", {
  id: varchar("id").primaryKey().notNull(),
  payload: varchar("payload").notNull(),
});
