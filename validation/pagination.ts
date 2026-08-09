import { z } from "zod";

/**
 * Schema pagination bersama — dipakai query string API/halaman.
 * nilai default: page 1, perPage 10.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
