import { z } from "zod";

/**
 * SuperAdmin login validation
 */
export const loginSuperAdminSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

/**
 * Update SuperAdmin profile validation
 */
export const updateSuperAdminProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
  }),
});

/**
 * Update SuperAdmin password validation
 */
export const updateSuperAdminPasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  }),
});

export const SuperAdminValidation = {
  loginSuperAdminSchema,
  updateSuperAdminProfileSchema,
  updateSuperAdminPasswordSchema,
};
