import { db } from "@/db/index";
import type { PresentIdea } from "@/db/schema";
import { presentIdeas } from "@/db/schema";

export const savePresentIdea = async (presentIdea: PresentIdea) => {
  await db.insert(presentIdeas).values(presentIdea);
};
