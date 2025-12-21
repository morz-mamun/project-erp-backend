import mongoose, { Document, Types } from "mongoose";
import {
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus,
} from "../../utils/enum/payment";

/**
 * Invoice item interface
 */
export interface IInvoiceItem {
  productId: Types.ObjectId;
  productName: string;
  variationSku?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * Invoice/Sales interface
 */
export interface IInvoice extends Document {
  _id: Types.ObjectId;
  invoiceNumber: string;
  companyId: Types.ObjectId;
  customerId?: Types.ObjectId;
  customerName?: string;
  items: IInvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  dueAmount: number;
  status: InvoiceStatus;
  createdBy: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
