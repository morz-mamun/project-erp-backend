/**
 * Payment method enumeration
 */
export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  DUE = "DUE",
}

/**
 * Payment status enumeration
 */
export enum PaymentStatus {
  PAID = "PAID",
  PARTIAL = "PARTIAL",
  DUE = "DUE",
}

/**
 * Invoice status enumeration
 */
export enum InvoiceStatus {
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}
