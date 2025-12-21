import { z } from "zod";
import { CompanyStatus } from "../../utils/enum/companyStatus";
import { SubscriptionPlan } from "../../utils/enum/subscriptionPlan";

/**
 * Register company validation
 */
export const registerCompanySchema = z.object({
  body: z.object({
    companyName: z.string().min(1, "Company name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    adminName: z.string().min(1, "Admin name is required"),
    adminEmail: z.string().email("Invalid admin email address"),
    adminPhone: z
      .string()
      .min(10, "Admin phone number must be at least 10 digits"),
    adminPassword: z
      .string()
      .min(6, "Admin password must be at least 6 characters"),
  }),
});

/**
 * Approve company validation
 */
export const approveCompanySchema = z.object({
  body: z.object({
    subscription: z
      .object({
        plan: z.nativeEnum(SubscriptionPlan).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        features: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

/**
 * Update company validation
 */
export const updateCompanySchema = z.object({
  body: z.object({
    companyName: z.string().min(1, "Company name is required").optional(),
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
        country: z.string().optional(),
      })
      .optional(),
    logo: z.string().url("Invalid logo URL").optional(),
    settings: z
      .object({
        currency: z.string().optional(),
        timezone: z.string().optional(),
        taxRate: z.number().min(0).max(100).optional(),
      })
      .optional(),
  }),
});

export const CompanyValidation = {
  registerCompanySchema,
  approveCompanySchema,
  updateCompanySchema,
};
