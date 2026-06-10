import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

export function createPrismaClient(connectionString: string) {
  const pool = new Pool({ connectionString });
  return new PrismaClient({
    adapter: new PrismaPg(pool),
  });
}

export { PrismaClient } from "./generated/prisma/client";
export type { User } from "./generated/prisma/client";
