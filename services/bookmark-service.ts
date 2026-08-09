import * as bookmarkRepository from "@/repositories/bookmark-repository";

export async function listBookmarksByUser(userId: string) {
  return bookmarkRepository.listBookmarksByUser(userId);
}

export async function toggleBookmark(userId: string, audioId: string) {
  const existing = await bookmarkRepository.getBookmark(userId, audioId);
  if (existing) {
    await bookmarkRepository.deleteBookmark(userId, audioId);
    return { bookmarked: false };
  }
  await bookmarkRepository.createBookmark(userId, audioId);
  return { bookmarked: true };
}

export async function isBookmarked(userId: string, audioId: string) {
  const bookmark = await bookmarkRepository.getBookmark(userId, audioId);
  return Boolean(bookmark);
}

export async function countByUser(userId: string) {
  return bookmarkRepository.countByUser(userId);
}
