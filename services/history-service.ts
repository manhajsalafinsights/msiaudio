import * as historyRepository from "@/repositories/history-repository";

export async function getListeningState(userId: string, audioId: string) {
  return historyRepository.getListeningState(userId, audioId);
}

export async function listHistoryByUser(userId: string, opts: { page: number; perPage: number }) {
  return historyRepository.listHistoryByUser(userId, opts);
}

export async function upsertListeningState(
  userId: string,
  audioId: string,
  data: {
    positionSeconds?: number;
    progressPercent?: number;
    completed?: boolean;
    playCount?: number;
  },
) {
  return historyRepository.upsertListeningState(userId, audioId, data);
}

export async function countByUser(userId: string) {
  return historyRepository.countByUser(userId);
}
