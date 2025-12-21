import { z } from "zod";
import { StockMovementType } from "../../utils/enum/stockMovement";

/**
 * Stock in validation
 */
export const stockInSchema = z.object({
  body: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
    variationSku: z.string().optional(),
    quantity: z.number().positive("Quantity must be positive"),
    reason: z.string().optional(),
    notes: z.string().optional(),
  }),
});

/**
 * Adjust stock validation
 */
export const adjustStockSchema = z.object({
  body: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
    variationSku: z.string().optional(),
    quantity: z.number("Quantity is required"), // Can be negative
    reason: z.string().min(1, "Reason is required"),
    notes: z.string().optional(),
  }),
});

export const InventoryValidation = {
  stockInSchema,
  adjustStockSchema,
};
