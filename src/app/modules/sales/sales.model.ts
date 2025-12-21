import mongoose, { Model, Schema } from "mongoose";
import { IInvoice } from "./sales.interface";
import {
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus,
} from "../../utils/enum/payment";

/**
 * Invoice/Sales Schema
 */
const InvoiceSchema: Schema<IInvoice> = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      trim: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    customerName: {
      type: String,
      trim: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product ID is required"],
        },
        productName: {
          type: String,
          required: [true, "Product name is required"],
        },
        variationSku: String,
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        unitPrice: {
          type: Number,
          required: [true, "Unit price is required"],
          min: [0, "Unit price cannot be negative"],
        },
        discount: {
          type: Number,
          default: 0,
          min: [0, "Discount cannot be negative"],
        },
        tax: {
          type: Number,
          default: 0,
          min: [0, "Tax cannot be negative"],
        },
        total: {
          type: Number,
          required: [true, "Total is required"],
          min: [0, "Total cannot be negative"],
        },
      },
    ],
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },
    grandTotal: {
      type: Number,
      required: [true, "Grand total is required"],
      min: [0, "Grand total cannot be negative"],
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: [true, "Payment method is required"],
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PAID,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: [0, "Due amount cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.COMPLETED,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
InvoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ companyId: 1, createdAt: -1 });
InvoiceSchema.index({ companyId: 1, paymentStatus: 1 });

// Model Export
const Invoice: Model<IInvoice> = mongoose.model<IInvoice>(
  "Invoice",
  InvoiceSchema,
);

export default Invoice;
