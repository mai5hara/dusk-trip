-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('morning', 'afternoon', 'evening', 'night');

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN "timeOfDay" "TimeOfDay";
