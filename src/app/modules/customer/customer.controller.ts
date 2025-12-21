import { NextFunction, Request, Response } from "express";
import { CustomerService } from "./customer.service";
import sendResponse from "../../utils/sendResponse";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { asyncHandler } from "../../utils/asyncHandler";

/**
 * Create customer
 */
const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { companyId } = req.user!;
  const result = await CustomerService.createCustomer(
    companyId!.toString(),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Customer created successfully",
    data: result,
  });
  next();
};

/**
 * Get all customers
 */
const getAllCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { companyId } = req.user!;
  const result = await CustomerService.getAllCustomers(
    companyId!.toString(),
    req.query as any,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Customers retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Get customer by ID
 */
const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await CustomerService.getCustomerById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Customer retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Update customer
 */
const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await CustomerService.updateCustomer(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Customer updated successfully",
    data: result,
  });
  next();
};

/**
 * Delete customer
 */
const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await CustomerService.deleteCustomer(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Customer deleted successfully",
  });
  next();
};

/**
 * Get customer purchase history
 */
const getCustomerPurchaseHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await CustomerService.getCustomerPurchaseHistory(
    req.params.id,
    req.query as any,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Purchase history retrieved successfully",
    data: result,
  });
  next();
};

export const CustomerController = {
  createCustomer: asyncHandler(createCustomer),
  getAllCustomers: asyncHandler(getAllCustomers),
  getCustomerById: asyncHandler(getCustomerById),
  updateCustomer: asyncHandler(updateCustomer),
  deleteCustomer: asyncHandler(deleteCustomer),
  getCustomerPurchaseHistory: asyncHandler(getCustomerPurchaseHistory),
};
