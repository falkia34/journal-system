/*
  Warnings:

  - You are about to drop the column `fileId` on the `feedbacks` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `revisions` table. All the data in the column will be lost.
  - You are about to drop the `files` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "feedbacks" DROP CONSTRAINT "feedbacks_fileId_fkey";

-- DropForeignKey
ALTER TABLE "revisions" DROP CONSTRAINT "revisions_fileId_fkey";

-- AlterTable
ALTER TABLE "feedbacks" DROP COLUMN "fileId",
ADD COLUMN     "file" TEXT;

-- AlterTable
ALTER TABLE "revisions" DROP COLUMN "fileId",
ADD COLUMN     "file" TEXT;

-- DropTable
DROP TABLE "files";
