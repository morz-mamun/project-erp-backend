import mongoose from "mongoose";
import { ICompany } from "./company.interface";
import Company from "./company.model";
import User from "../auth/auth.user.model";
import { UserRole } from "../../utils/enum/userRole";
import { CompanyStatus } from "../../utils/enum/companyStatus";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";

/**
 * Register new company with Company Admin
 * @param payload - Company and admin details
 * @returns Created company and admin user
 */
const registerCompany = async (payload: {
  companyName: string;
  email: string;
  phone: string;
  address?: any;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
}): Promise<{ company: ICompany; admin: any }> => {
  const {
    companyName,
    email,
    phone,
    address,
    adminName,
    adminEmail,
    adminPhone,
    adminPassword,
  } = payload;

  // Check if company email already exists
  const existingCompany = await Company.findOne({ email });
  if (existingCompany) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      "Company email already exists",
    );
  }

  // Check if admin email already exists
  const existingUser = await User.findOne({ email: adminEmail });
  if (existingUser) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      "Admin email already exists",
    );
  }

  // Create company with PENDING status
  const company = await Company.create({
    companyName,
    email,
    phone,
    address,
    status: CompanyStatus.PENDING,
  });

  // Create Company Admin user
  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    phone: adminPhone,
    password: adminPassword,
    role: UserRole.COMPANY_ADMIN,
    companyId: company._id,
    isActive: false, // Inactive until company is approved
  });

  return {
    company,
    admin: admin.toProfileJSON(),
  };
};

/**
 * Get all companies (Super Admin only)
 * @param query - Filter and pagination options
 * @returns Companies list with pagination
 */
const getAllCompanies = async (query: {
  status?: CompanyStatus;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ companies: ICompany[]; metadata: any }> => {
  const { status, page = 1, limit = 20, search } = query;

  const filter: any = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { companyName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const companies = await Company.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Company.countDocuments(filter);

  return {
    companies,
    metadata: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get company by ID
 * @param id - Company ID
 * @returns Company details
 */
const getCompanyById = async (id: string): Promise<ICompany> => {
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Company not found");
  }
  return company;
};

/**
 * Approve company (Super Admin only)
 * @param id - Company ID
 * @param payload - Subscription details
 * @returns Updated company
 */
const approveCompany = async (
  id: string,
  payload: { subscription?: any } = {},
): Promise<ICompany> => {
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Company not found");
  }

  if (company.status !== CompanyStatus.PENDING) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      "Company is not pending approval",
    );
  }

  // Update company status
  company.status = CompanyStatus.APPROVED;
  if (payload.subscription) {
    company.subscription = { ...company.subscription, ...payload.subscription };
  }
  await company.save();

  // Activate company admin
  await User.updateMany(
    { companyId: company._id, role: UserRole.COMPANY_ADMIN },
    { isActive: true },
  );

  return company;
};

/**
 * Suspend company (Super Admin only)
 * @param id - Company ID
 * @returns Updated company
 */
const suspendCompany = async (id: string): Promise<ICompany> => {
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Company not found");
  }

  company.status = CompanyStatus.SUSPENDED;
  company.isActive = false;
  await company.save();

  // Deactivate all company users
  await User.updateMany({ companyId: company._id }, { isActive: false });

  return company;
};

/**
 * Reject company (Super Admin only)
 * @param id - Company ID
 * @returns Updated company
 */
const rejectCompany = async (id: string): Promise<ICompany> => {
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Company not found");
  }

  company.status = CompanyStatus.REJECTED;
  await company.save();

  return company;
};

/**
 * Update company details
 * @param id - Company ID
 * @param payload - Update data
 * @returns Updated company
 */
const updateCompany = async (
  id: string,
  payload: Partial<ICompany>,
): Promise<ICompany> => {
  // Prevent status updates through this method
  const { status, ...updateData } = payload;

  const company = await Company.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!company) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Company not found");
  }

  return company;
};

/**
 * Delete company (Super Admin only)
 * @param id - Company ID
 */
const deleteCompany = async (id: string): Promise<void> => {
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Company not found");
  }

  // Soft delete
  company.isDeleted = true;
  company.isActive = false;
  await company.save();

  // Soft delete all company users
  await User.updateMany(
    { companyId: company._id },
    { isDeleted: true, isActive: false },
  );
};

export const CompanyService = {
  registerCompany,
  getAllCompanies,
  getCompanyById,
  approveCompany,
  suspendCompany,
  rejectCompany,
  updateCompany,
  deleteCompany,
};
