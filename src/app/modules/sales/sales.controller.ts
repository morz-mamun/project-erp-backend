import { NextFunction, Request, Response } from "express";
import { SalesService } from "./sales.service";
import sendResponse from "../../utils/sendResponse";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { asyncHandler } from "../../utils/asyncHandler";

/**
 * Create invoice
 */
const createInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { companyId, userId } = req.user!;
  const result = await SalesService.createInvoice(
    companyId!.toString(),
    userId.toString(),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Invoice created successfully",
    data: result,
  });
  next();
};

/**
 * Get all invoices
 */
const getAllInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { companyId } = req.user!;
  const result = await SalesService.getAllInvoices(
    companyId!.toString(),
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Invoices retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Get invoice by ID
 */
const getInvoiceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await SalesService.getInvoiceById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Invoice retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Cancel invoice
 */
const cancelInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await SalesService.cancelInvoice(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Invoice cancelled successfully",
    data: result,
  });
  next();
};

/**
 * Refund invoice
 */
const refundInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { companyId, userId } = req.user!;
  const result = await SalesService.refundInvoice(
    companyId!.toString(),
    userId.toString(),
    req.params.id,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Invoice refunded successfully",
    data: result,
  });
  next();
};

export const SalesController = {
  createInvoice: asyncHandler(createInvoice),
  getAllInvoices: asyncHandler(getAllInvoices),
  getInvoiceById: asyncHandler(getInvoiceById),
  cancelInvoice: asyncHandler(cancelInvoice),
  refundInvoice: asyncHandler(refundInvoice),
};
