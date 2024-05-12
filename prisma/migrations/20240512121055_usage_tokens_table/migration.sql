-- CreateTable
CREATE TABLE "token_usages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL,
    "completion_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "token_usages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "token_usages" ADD CONSTRAINT "token_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
