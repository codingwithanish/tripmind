-- CreateEnum
CREATE TYPE "MessageStage" AS ENUM ('init', 'timeline_generation', 'timeline_support');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "help_context" JSONB,
ADD COLUMN     "message_stage" "MessageStage" NOT NULL DEFAULT 'init';
