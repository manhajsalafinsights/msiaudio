import { Prisma } from "@prisma/client";
import { AppError, ConflictError, NotFoundError } from "@/lib/errors/app-error";
import { ErrorCodes } from "@/lib/errors/codes";

/**
 * Peta error Prisma → AppError.
 * P2002 : unique constraint dilanggar → Conflict
 * P2003 : foreign key tidak valid       → Conflict
 * P2025 : record tidak ditemukan        → NotFound
 * Lainnya → AppError internal (tidak membocorkan detail Prisma ke client).
 */
export function mapPrismaError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return new ConflictError("Data sudah ada (melanggar batas unik).");
      case "P2003":
        return new ConflictError("Data terkait tidak ditemukan.");
      case "P2025":
        return new NotFoundError();
    }
  }

  return new AppError(500, ErrorCodes.INTERNAL, "Terjadi kesalahan internal.");
}
