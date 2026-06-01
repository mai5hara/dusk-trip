import { PrismaClient } from "./generated/prisma/client";

export const prisma = new PrismaClient();
export type { User } from "./generated/prisma/client";
