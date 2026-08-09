import { NotFoundError } from "@/lib/errors/app-error";
import * as userRepository from "@/repositories/user-repository";

export async function getUserById(id: string) {
  const user = await userRepository.getUserById(id);
  if (!user) throw new NotFoundError("Pengguna tidak ditemukan");
  return user;
}

export async function getUserByEmail(email: string) {
  return userRepository.getUserByEmail(email);
}

export async function listUsers(opts: { page: number; perPage: number }) {
  return userRepository.listUsers(opts);
}

export async function updateUser(
  id: string,
  data: Parameters<typeof userRepository.updateUser>[1],
) {
  return userRepository.updateUser(id, data);
}

export async function countUsers() {
  return userRepository.countUsers();
}
