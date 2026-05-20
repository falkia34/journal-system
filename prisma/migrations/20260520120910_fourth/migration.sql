/*
  Warnings:

  - Added the required column `authors` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "authors" JSONB NOT NULL;
