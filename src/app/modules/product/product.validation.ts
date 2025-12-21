import { z } from "zod";

/**
 * Create category validation
 */
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required"),
    description: z.string().optional(),
  }),
});

/**
 * Update category validation
 */
export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Create brand validation
 */
export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Brand name is required"),
    description: z.string().optional(),
    logo: z.string().url("Invalid logo URL").optional(),
  }),
});

/**
 * Update brand validation
 */
export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Brand name is required").optional(),
    description: z.string().optional(),
    logo: z.string().url("Invalid logo URL").optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Create product validation
 */
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    description: z.string().optional(),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
    brandId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid brand ID")
      .optional(),
    images: z
      .array(
        z.object({
          url: z.string().url("Invalid image URL"),
          publicId: z.string().optional(),
        }),
      )
      .optional(),
    variations: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
          sku: z.string().optional(),
          price: z.number().positive().optional(),
          stock: z.number().min(0).optional(),
        }),
      )
      .optional(),
    basePrice: z.number().positive("Base price must be positive"),
    costPrice: z.number().positive("Cost price must be positive").optional(),
    taxRate: z
      .number()
      .min(0)
      .max(100, "Tax rate must be between 0 and 100")
      .default(0),
    unit: z.string().default("pcs"),
  }),
});

/**
 * Update product validation
 */
export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required").optional(),
    description: z.string().optional(),
    categoryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID")
      .optional(),
    brandId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid brand ID")
      .optional(),
    images: z
      .array(
        z.object({
          url: z.string().url("Invalid image URL"),
          publicId: z.string().optional(),
        }),
      )
      .optional(),
    variations: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
          sku: z.string().optional(),
          price: z.number().positive().optional(),
          stock: z.number().min(0).optional(),
        }),
      )
      .optional(),
    basePrice: z.number().positive("Base price must be positive").optional(),
    costPrice: z.number().positive("Cost price must be positive").optional(),
    taxRate: z
      .number()
      .min(0)
      .max(100, "Tax rate must be between 0 and 100")
      .optional(),
    unit: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const ProductValidation = {
  createCategorySchema,
  updateCategorySchema,
  createBrandSchema,
  updateBrandSchema,
  createProductSchema,
  updateProductSchema,
};
