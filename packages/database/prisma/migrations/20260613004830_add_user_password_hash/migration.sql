-- AlterTable: add nullable column, backfill existing rows, then enforce NOT NULL
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- Dev placeholder: bcrypt hash of "password"
UPDATE "User"
SET "passwordHash" = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE "passwordHash" IS NULL;

ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
