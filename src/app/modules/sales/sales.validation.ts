import { z } from "zod";
import { PaymentMethod } from "../../utils/enum/payment";

/**
 * Create invoice validation
 */
export const createInvoiceSchema = z.object({
  body: z.object({
    customerId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid customer ID")
      .optional(),
    customerName: z.string().optional(),
    items: z
      .array(
        z.object({
          productId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
          productName: z.string().min(1, "Product name is required"),
          variationSku: z.string().optional(),
          quantity: z.number().positive("Quantity must be positive"),
          unitPrice: z.number().positive("Unit price must be positive"),
          discount: z.number().min(0, "Discount cannot be negative").default(0),
          tax: z.number().min(0, "Tax cannot be negative").default(0),
        }),
      )
      .min(1, "At least one item is required"),
    discount: z.number().min(0, "Discount cannot be negative").default(0),
    paymentMethod: z.nativeEnum(PaymentMethod),
    paidAmount: z.number().min(0, "Paid amount cannot be negative").default(0),
    notes: z.string().optional(),
  }),
});

export const SalesValidation = {
  createInvoiceSchema,
};
