-- CreateEnum
CREATE TYPE "CommentTarget" AS ENUM ('KITAB', 'SERIES');

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "targetType" "CommentTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "userId" TEXT,
    "nama" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comments_targetType_targetId_createdAt_idx" ON "comments"("targetType", "targetId", "createdAt");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
