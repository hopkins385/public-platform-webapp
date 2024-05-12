/*
  Warnings:

  - Added the required column `cost` to the `token_usages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `llm_model` to the `token_usages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `llm_provider` to the `token_usages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "token_usages" ADD COLUMN     "cost" INTEGER NOT NULL,
ADD COLUMN     "llm_model" TEXT NOT NULL,
ADD COLUMN     "llm_provider" TEXT NOT NULL;
