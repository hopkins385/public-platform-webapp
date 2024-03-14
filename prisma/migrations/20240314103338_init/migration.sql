-- CreateEnum
CREATE TYPE "chat_messages_role_enum" AS ENUM ('user', 'assistant');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "device_id" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "google_refresh_token" TEXT,
    "google_access_token" TEXT,
    "azure_account_info" JSON,
    "azure_access_token" TEXT,
    "email_verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "assistant_id" TEXT NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "role" "chat_messages_role_enum" NOT NULL,
    "content" TEXT NOT NULL,
    "token_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistants" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "system_prompt_token_count" INTEGER NOT NULL,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "is_general" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT,

    CONSTRAINT "assistants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistants" ADD CONSTRAINT "assistants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
