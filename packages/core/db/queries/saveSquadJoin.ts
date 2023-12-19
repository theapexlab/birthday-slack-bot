import { db } from "@/db/index";
import type { SquadJoin } from "@/db/schema";
import { squadJoins } from "@/db/schema";

export const saveSquadJoin = async (squadJoin: SquadJoin) => {
  console.log("Saving squad join", squadJoin);

  await db.insert(squadJoins).values(squadJoin);

  console.log("Squad join saved", squadJoin);
};
