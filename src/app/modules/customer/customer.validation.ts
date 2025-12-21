import { z } from "zod";

/**
 * Create customer validation
 */
export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      })
      .optional(),
    notes: z.string().optional(),
  }),
});

/**
 * Update customer validation
 */
export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Customer name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .optional(),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      })
      .optional(),
    notes: z.string().optional(),
  }),
});

export const CustomerValidation = {
  createCustomerSchema,
  updateCustomerSchema,
};
