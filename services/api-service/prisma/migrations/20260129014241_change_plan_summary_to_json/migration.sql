/*
  Warnings:

  - The `plan_summary` column on the `thread_contexts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "thread_contexts" DROP COLUMN "plan_summary",
ADD COLUMN     "plan_summary" JSONB;
