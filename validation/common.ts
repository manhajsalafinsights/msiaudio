import { z } from "zod";

/** ID Prisma (cuid) — string non-kosong. */
export const idSchema = z.string().min(1, "ID tidak valid");

/** Slug — huruf kecil, angka, dan tanda hubung. */
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug tidak valid");

/** Rentang tanggal (ISO). */
export const dateRangeSchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

/** Search query umum. */
export const searchQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
});
