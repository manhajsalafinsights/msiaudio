import { z } from "zod";
import { CommentTarget } from "@prisma/client";

export const commentTargetSchema = z.enum([CommentTarget.KITAB, CommentTarget.SERIES]);

export const commentNamaSchema = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter")
  .max(60, "Nama maksimal 60 karakter");

export const commentContentSchema = z
  .string()
  .trim()
  .min(3, "Komentar minimal 3 karakter")
  .max(1000, "Komentar maksimal 1000 karakter");

export const submitCommentSchema = z.object({
  targetType: commentTargetSchema,
  targetId: z.string().min(1, "Target tidak valid"),
  nama: commentNamaSchema.optional(),
  content: commentContentSchema,
});

export type SubmitCommentInput = z.infer<typeof submitCommentSchema>;