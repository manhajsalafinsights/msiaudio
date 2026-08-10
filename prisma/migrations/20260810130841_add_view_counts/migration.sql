-- AlterTable
ALTER TABLE "series" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "series_types" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;
