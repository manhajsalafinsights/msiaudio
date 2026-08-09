import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserByEmailWithAccounts(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { accounts: { select: { id: true, providerId: true } } },
  });
}

export async function listUsers(opts: { page: number; perPage: number }) {
  const [total, items] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (opts.page - 1) * opts.perPage,
      take: opts.perPage,
    }),
  ]);
  return { items, total };
}

export async function updateUser(id: string, data: Partial<Prisma.UserUpdateInput>) {
  return prisma.user.update({ where: { id }, data });
}

export async function countUsers() {
  return prisma.user.count();
}
