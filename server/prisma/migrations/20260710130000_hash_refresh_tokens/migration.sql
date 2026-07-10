-- AlterTable: Rename token column to tokenHash for secure storage
ALTER TABLE "RefreshToken" RENAME COLUMN "token" TO "tokenHash";
