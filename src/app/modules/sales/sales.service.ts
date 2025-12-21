import { IInvoice } from "./sales.interface";
import Invoice from "./sales.model";
import Customer from "../customer/customer.model";
import { InventoryService } from "../inventory/inventory.service";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { InvoiceStatus, PaymentStatus } from "../../utils/enum/payment";

/**
 * Generate unique invoice number
 */
const generateInvoiceNumber = async (companyId: string): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Count invoices for this month
  const count = await Invoice.countDocuments({
    companyId,
    createdAt: {
      $gte: new Date(year, date.getMonth(), 1),
      $lt: new Date(year, date.getMonth() + 1, 1),
    },
  });

  const invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, "0")}`;
  return invoiceNumber;
};

/**
 * Create invoice/sale
 */
const createInvoice = async (
  companyId: string,
  userId: string,
  payload: Partial<IInvoice>,
): Promise<IInvoice> => {
  const {
    items,
    customerId,
    discount = 0,
    paymentMethod,
    paidAmount = 0,
  } = payload;

  if (!items || items.length === 0) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      "Invoice must have at least one item",
    );
  }

  // Calculate totals
  let subtotal = 0;
  let totalTax = 0;

  for (const item of items) {
    item.total = item.quantity * item.unitPrice - item.discount + item.tax;
    subtotal += item.quantity * item.unitPrice;
    totalTax += item.tax;
  }

  const grandTotal = subtotal - discount + totalTax;
  const dueAmount = grandTotal - paidAmount;

  // Determine payment status
  let paymentStatus: PaymentStatus;
  if (paidAmount === 0) {
    paymentStatus = PaymentStatus.DUE;
  } else if (paidAmount < grandTotal) {
    paymentStatus = PaymentStatus.PARTIAL;
  } else {
    paymentStatus = PaymentStatus.PAID;
  }

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber(companyId);

  // Create invoice
  const invoice = await Invoice.create({
    invoiceNumber,
    companyId,
    customerId,
    items,
    subtotal,
    discount,
    tax: totalTax,
    grandTotal,
    paymentMethod,
    paymentStatus,
    paidAmount,
    dueAmount,
    status: InvoiceStatus.COMPLETED,
    createdBy: userId,
  });

  // Update inventory for each item (stock out)
  for (const item of items) {
    await InventoryService.stockOut(companyId, userId, {
      productId: item.productId.toString(),
      variationSku: item.variationSku,
      quantity: item.quantity,
      referenceId: invoice._id.toString(),
      notes: `Sale - Invoice ${invoiceNumber}`,
    });
  }

  // Update customer stats if customer exists
  if (customerId) {
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalPurchases: 1, totalSpent: grandTotal },
      lastPurchaseDate: new Date(),
    });
  }

  return invoice;
};

/**
 * Get all invoices
 */
const getAllInvoices = async (
  companyId: string,
  query: {
    status?: InvoiceStatus;
    paymentStatus?: PaymentStatus;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<{ invoices: IInvoice[]; metadata: any }> => {
  const {
    status,
    paymentStatus,
    customerId,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = query;

  const filter: any = { companyId };
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (customerId) filter.customerId = customerId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const invoices = await Invoice.find(filter)
    .populate("customerId", "name phone email")
    .populate("createdBy", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Invoice.countDocuments(filter);

  return {
    invoices,
    metadata: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get invoice by ID
 */
const getInvoiceById = async (id: string): Promise<IInvoice> => {
  const invoice = await Invoice.findById(id)
    .populate("customerId", "name phone email address")
    .populate("createdBy", "name email")
    .populate("items.productId", "name sku");

  if (!invoice) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Invoice not found");
  }
  return invoice;
};

/**
 * Cancel invoice
 */
const cancelInvoice = async (id: string): Promise<IInvoice> => {
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Invoice not found");
  }

  if (invoice.status !== InvoiceStatus.COMPLETED) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      "Only completed invoices can be cancelled",
    );
  }

  invoice.status = InvoiceStatus.CANCELLED;
  await invoice.save();

  return invoice;
};

/**
 * Refund invoice (restocks items)
 */
const refundInvoice = async (
  companyId: string,
  userId: string,
  id: string,
): Promise<IInvoice> => {
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Invoice not found");
  }

  if (invoice.status !== InvoiceStatus.COMPLETED) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      "Only completed invoices can be refunded",
    );
  }

  // Restock items
  for (const item of invoice.items) {
    await InventoryService.stockIn(companyId, userId, {
      productId: item.productId.toString(),
      variationSku: item.variationSku,
      quantity: item.quantity,
      reason: "Refund",
      notes: `Refund - Invoice ${invoice.invoiceNumber}`,
    });
  }

  // Update customer stats
  if (invoice.customerId) {
    await Customer.findByIdAndUpdate(invoice.customerId, {
      $inc: { totalPurchases: -1, totalSpent: -invoice.grandTotal },
    });
  }

  invoice.status = InvoiceStatus.REFUNDED;
  await invoice.save();

  return invoice;
};

export const SalesService = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  cancelInvoice,
  refundInvoice,
};
