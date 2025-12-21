import { z } from "zod";

/**
 * Create role request validation
 */
export const createRoleRequestSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .min(10, "Reason must be at least 10 characters")
      .optional(),
  }),
});

/**
 * Review role request validation
 */
export const reviewRoleRequestSchema = z.object({
  body: z.object({
    reviewNotes: z.string().optional(),
  }),
});

export const RoleRequestValidation = {
  createRoleRequestSchema,
  reviewRoleRequestSchema,
};
