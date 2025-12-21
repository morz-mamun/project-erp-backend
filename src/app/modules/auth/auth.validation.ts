import { z } from "zod";
import { UserRole } from "../../utils/enum/userRole";

/**
 * Login validation
 */
const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

/**
 * Update profile validation
 */
const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .optional(),
    avatar: z.string().url("Invalid avatar URL").optional(),
  }),
});

/**
 * Update password validation
 */
const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  }),
});

/**
 * Create user validation
 */
const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum([UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.USER]),
  }),
});

/**
 * Update user role validation
 */
const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum([UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.USER]),
  }),
});

export const AuthValidation = {
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  createUserSchema,
  updateRoleSchema,
};
