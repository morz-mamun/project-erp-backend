import mongoose from "mongoose";
import { ICustomer } from "./customer.interface";
import Customer from "./customer.model";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";

/**
 * Create customer
 */
const createCustomer = async (
  companyId: string,
  payload: Partial<ICustomer>,
): Promise<ICustomer> => {
  // Check if customer with same phone exists
  const existing = await Customer.findOne({ companyId, phone: payload.phone });
  if (existing) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      "Customer with this phone already exists",
    );
  }

  const customer = await Customer.create({ ...payload, companyId });
  return customer;
};

/**
 * Get all customers
 */
const getAllCustomers = async (
  companyId: string,
  query: { search?: string; page?: number; limit?: number } = {},
): Promise<{ customers: ICustomer[]; metadata: any }> => {
  const { search, page = 1, limit = 20 } = query;

  const filter: any = { companyId };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const customers = await Customer.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Customer.countDocuments(filter);

  return {
    customers,
    metadata: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get customer by ID
 */
const getCustomerById = async (id: string): Promise<ICustomer> => {
  const customer = await Customer.findById(id);
  if (!customer) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Customer not found");
  }
  return customer;
};

/**
 * Update customer
 */
const updateCustomer = async (
  id: string,
  payload: Partial<ICustomer>,
): Promise<ICustomer> => {
  const customer = await Customer.findByIdAndUpdate(id, payload, { new: true });
  if (!customer) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Customer not found");
  }
  return customer;
};

/**
 * Delete customer
 */
const deleteCustomer = async (id: string): Promise<void> => {
  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Customer not found");
  }
};

/**
 * Get customer purchase history
 */
const getCustomerPurchaseHistory = async (
  customerId: string,
  query: { page?: number; limit?: number } = {},
): Promise<any> => {
  const { page = 1, limit = 10 } = query;

  // This will be implemented when Invoice module is ready
  // For now, return basic customer info
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Customer not found");
  }

  return {
    customer,
    purchases: [], // Will be populated with invoices
    metadata: {
      total: customer.totalPurchases,
      totalSpent: customer.totalSpent,
      page,
      limit,
    },
  };
};

export const CustomerService = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerPurchaseHistory,
};
