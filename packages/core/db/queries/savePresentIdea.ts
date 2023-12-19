import { db } from "@/db/index";
import type { PresentIdea } from "@/db/schema";
import { presentIdeas } from "@/db/schema";

export const savePresentIdea = async (presentIdea: PresentIdea) => {
  console.log("Saving present idea", presentIdea);

  await db.insert(presentIdeas).values(presentIdea);

  console.log("Present idea saved", presentIdea);
};
