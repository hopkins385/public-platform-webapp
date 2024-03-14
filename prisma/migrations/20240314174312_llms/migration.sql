-- CreateTable
CREATE TABLE "llms" (
    "id" TEXT NOT NULL,
    "api_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "context_size" INTEGER NOT NULL,
    "max_tokens" INTEGER NOT NULL,
    "multi_modal" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "free" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "llms_pkey" PRIMARY KEY ("id")
);
