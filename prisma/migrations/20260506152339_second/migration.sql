-- AlterTable
ALTER TABLE "publications" ALTER COLUMN "publishedAt" DROP NOT NULL,
ALTER COLUMN "publishedAt" DROP DEFAULT;
