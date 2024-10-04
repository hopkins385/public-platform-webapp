-- CreateEnum
CREATE TYPE "text_to_image_run_status" AS ENUM ('PENDING', 'COMPLETED', 'MODERATED', 'FAILED');

-- CreateTable
CREATE TABLE "text_to_image_folders" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "text_to_image_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_to_image_runs" (
    "id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "settings" JSONB,
    "status" "text_to_image_run_status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "text_to_image_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_to_images" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "text_to_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "text_to_image_folders_project_id_idx" ON "text_to_image_folders"("project_id");

-- CreateIndex
CREATE INDEX "text_to_image_runs_folder_id_idx" ON "text_to_image_runs"("folder_id");

-- CreateIndex
CREATE INDEX "text_to_images_run_id_idx" ON "text_to_images"("run_id");

-- AddForeignKey
ALTER TABLE "text_to_image_folders" ADD CONSTRAINT "text_to_image_folders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_to_image_runs" ADD CONSTRAINT "text_to_image_runs_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "text_to_image_folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_to_images" ADD CONSTRAINT "text_to_images_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "text_to_image_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
