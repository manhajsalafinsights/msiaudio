-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "SpeakerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('YOUTUBE', 'CLOUDFLARE_R2', 'BUNNY_CDN', 'BACKBLAZE', 'LOCAL_STORAGE');

-- CreateEnum
CREATE TYPE "TranscriptStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TranscriptProvider" AS ENUM ('OPENAI', 'WHISPER', 'MANUAL');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('PDF', 'EBOOK', 'KITAB', 'SLIDE', 'GAMBAR', 'REFERENSI', 'LINK_EKSTERNAL');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('QURAN', 'HADITH', 'KITAB', 'ARTICLE', 'QUOTE', 'NOTE');

-- CreateEnum
CREATE TYPE "RelatedTargetType" AS ENUM ('ARTICLE', 'EBOOK', 'VIDEO', 'ACADEMY', 'QA', 'EXTERNAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "foto" TEXT,
    "bio" TEXT,
    "status" "SpeakerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series_types" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "series_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cover" TEXT,
    "deskripsi" TEXT,
    "seriesTypeId" TEXT NOT NULL,
    "totalSesi" INTEGER NOT NULL DEFAULT 0,
    "totalDurasi" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "nomorSesi" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT,
    "durasi" INTEGER NOT NULL,
    "cover" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_sources" (
    "id" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,
    "provider" "MediaProvider" NOT NULL,
    "providerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcripts" (
    "id" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'id',
    "provider" "TranscriptProvider" NOT NULL,
    "content" TEXT,
    "status" "TranscriptStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_references" (
    "id" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,
    "startSecond" INTEGER NOT NULL,
    "endSecond" INTEGER,
    "type" "ReferenceType" NOT NULL,
    "title" TEXT,
    "reference" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audio_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "highlights" (
    "id" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,
    "startSecond" INTEGER NOT NULL,
    "endSecond" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "startSecond" INTEGER NOT NULL,
    "endSecond" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "lastAudioId" TEXT,
    "positionSeconds" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listening_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,
    "positionSeconds" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "playCount" INTEGER NOT NULL DEFAULT 1,
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listening_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,
    "positionSeconds" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_series" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series_speakers" (
    "seriesId" TEXT NOT NULL,
    "speakerId" TEXT NOT NULL,
    "role" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "series_speakers_pkey" PRIMARY KEY ("seriesId","speakerId")
);

-- CreateTable
CREATE TABLE "series_categories" (
    "seriesId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "series_categories_pkey" PRIMARY KEY ("seriesId","categoryId")
);

-- CreateTable
CREATE TABLE "series_tags" (
    "seriesId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "series_tags_pkey" PRIMARY KEY ("seriesId","tagId")
);

-- CreateTable
CREATE TABLE "related_contents" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "targetType" "RelatedTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "related_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "speakers_slug_key" ON "speakers"("slug");

-- CreateIndex
CREATE INDEX "speakers_status_idx" ON "speakers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "series_types_slug_key" ON "series_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "series_slug_key" ON "series"("slug");

-- CreateIndex
CREATE INDEX "series_published_createdAt_idx" ON "series"("published", "createdAt");

-- CreateIndex
CREATE INDEX "series_seriesTypeId_published_idx" ON "series"("seriesTypeId", "published");

-- CreateIndex
CREATE UNIQUE INDEX "audio_slug_key" ON "audio"("slug");

-- CreateIndex
CREATE INDEX "audio_seriesId_published_nomorSesi_idx" ON "audio"("seriesId", "published", "nomorSesi");

-- CreateIndex
CREATE INDEX "audio_published_createdAt_idx" ON "audio"("published", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "audio_seriesId_nomorSesi_key" ON "audio"("seriesId", "nomorSesi");

-- CreateIndex
CREATE INDEX "media_sources_audioId_idx" ON "media_sources"("audioId");

-- CreateIndex
CREATE UNIQUE INDEX "media_sources_provider_providerId_key" ON "media_sources"("provider", "providerId");

-- CreateIndex
CREATE INDEX "transcripts_audioId_status_idx" ON "transcripts"("audioId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "transcripts_audioId_language_key" ON "transcripts"("audioId", "language");

-- CreateIndex
CREATE INDEX "attachments_audioId_type_idx" ON "attachments"("audioId", "type");

-- CreateIndex
CREATE INDEX "audio_references_audioId_startSecond_idx" ON "audio_references"("audioId", "startSecond");

-- CreateIndex
CREATE INDEX "highlights_audioId_startSecond_idx" ON "highlights"("audioId", "startSecond");

-- CreateIndex
CREATE INDEX "chapters_audioId_startSecond_idx" ON "chapters"("audioId", "startSecond");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_audioId_urutan_key" ON "chapters"("audioId", "urutan");

-- CreateIndex
CREATE INDEX "user_progress_userId_updatedAt_idx" ON "user_progress"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_seriesId_key" ON "user_progress"("userId", "seriesId");

-- CreateIndex
CREATE INDEX "listening_history_userId_lastPlayedAt_idx" ON "listening_history"("userId", "lastPlayedAt");

-- CreateIndex
CREATE INDEX "listening_history_userId_audioId_completed_idx" ON "listening_history"("userId", "audioId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "listening_history_userId_audioId_key" ON "listening_history"("userId", "audioId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_createdAt_idx" ON "bookmarks"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_audioId_key" ON "bookmarks"("userId", "audioId");

-- CreateIndex
CREATE INDEX "notes_userId_audioId_idx" ON "notes"("userId", "audioId");

-- CreateIndex
CREATE INDEX "notes_userId_updatedAt_idx" ON "notes"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "favorite_series_userId_createdAt_idx" ON "favorite_series"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_series_userId_seriesId_key" ON "favorite_series"("userId", "seriesId");

-- CreateIndex
CREATE INDEX "series_speakers_speakerId_idx" ON "series_speakers"("speakerId");

-- CreateIndex
CREATE INDEX "series_categories_categoryId_idx" ON "series_categories"("categoryId");

-- CreateIndex
CREATE INDEX "series_tags_tagId_idx" ON "series_tags"("tagId");

-- CreateIndex
CREATE INDEX "related_contents_seriesId_sortOrder_idx" ON "related_contents"("seriesId", "sortOrder");

-- CreateIndex
CREATE INDEX "related_contents_targetType_targetId_idx" ON "related_contents"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_seriesTypeId_fkey" FOREIGN KEY ("seriesTypeId") REFERENCES "series_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio" ADD CONSTRAINT "audio_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_sources" ADD CONSTRAINT "media_sources_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_references" ADD CONSTRAINT "audio_references_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_lastAudioId_fkey" FOREIGN KEY ("lastAudioId") REFERENCES "audio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_series" ADD CONSTRAINT "favorite_series_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_series" ADD CONSTRAINT "favorite_series_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_speakers" ADD CONSTRAINT "series_speakers_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_speakers" ADD CONSTRAINT "series_speakers_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "speakers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_categories" ADD CONSTRAINT "series_categories_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_categories" ADD CONSTRAINT "series_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_tags" ADD CONSTRAINT "series_tags_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_tags" ADD CONSTRAINT "series_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "related_contents" ADD CONSTRAINT "related_contents_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
