-- AlterTable
ALTER TABLE "series_types" ADD COLUMN "isKitab" BOOLEAN NOT NULL DEFAULT true;

-- Tipe non-kitab (tidak tampil di "Pilihan Kitab")
UPDATE "series_types" SET "isKitab" = false
WHERE "slug" IN ('tematik', 'kajian-singkat', 'kajian-muslimah', 'podcast', 'seminar', 'ramadhan');
