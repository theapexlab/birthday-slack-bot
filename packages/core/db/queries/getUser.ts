import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { users } from "@/db/schema";

export const getUser = async (userId: string) =>
  db.query.users.findFirst({
    where: eq(users.id, userId),
  });
