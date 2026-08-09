import * as progressRepository from "@/repositories/progress-repository";

export async function getProgress(userId: string, seriesId: string) {
  return progressRepository.getProgress(userId, seriesId);
}

export async function listProgressByUser(userId: string) {
  return progressRepository.listProgressByUser(userId);
}

export async function updateProgress(
  userId: string,
  seriesId: string,
  data: {
    lastAudioId?: string;
    positionSeconds?: number;
    completedCount?: number;
    progressPercent?: number;
  },
) {
  return progressRepository.upsertProgress(userId, seriesId, data);
}

export async function countByUser(userId: string) {
  return progressRepository.countByUser(userId);
}
