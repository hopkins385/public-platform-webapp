-- AlterTable
ALTER TABLE "text_to_image_runs" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "text_to_images" ADD COLUMN     "status" "text_to_image_run_status" NOT NULL DEFAULT 'PENDING';
