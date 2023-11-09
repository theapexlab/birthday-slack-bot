import { db } from "@/db/index";
import type { SquadJoin } from "@/db/schema";
import { squadJoins } from "@/db/schema";

export const saveSquadJoin = async (squadJoin: SquadJoin) => {
  await db.insert(squadJoins).values(squadJoin);
};
