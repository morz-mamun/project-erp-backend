import { NextFunction, Request, Response } from "express";
import { CompanyService } from "./company.service";
import sendResponse from "../../utils/sendResponse";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { asyncHandler } from "../../utils/asyncHandler";

/**
 * Register new company
 */
const registerCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await CompanyService.registerCompany(req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Company registration successful. Awaiting admin approval.",
    data: result,
  });
  next();
};

/**
 * Get all companies (Super Admin only)
 */
const getAllCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await CompanyService.getAllCompanies(req.query as any);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Companies retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Get company by ID
 */
const getCompanyById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await CompanyService.getCompanyById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Company retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Approve company (Super Admin only)
 */
const approveCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await CompanyService.approveCompany(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Company approved successfully",
    data: result,
  });
  next();
};

/**
 * Suspend company (Super Admin only)
 */
const suspendCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await CompanyService.suspendCompany(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Company suspended successfully",
    data: result,
  });
  next();
};

/**
 * Reject company (Super Admin only)
 */
const rejectCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await CompanyService.rejectCompany(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Company rejected",
    data: result,
  });
  next();
};

/**
 * Update company
 */
const updateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await CompanyService.updateCompany(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Company updated successfully",
    data: result,
  });
  next();
};

/**
 * Delete company (Super Admin only)
 */
const deleteCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await CompanyService.deleteCompany(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Company deleted successfully",
  });
  next();
};

export const CompanyController = {
  registerCompany: asyncHandler(registerCompany),
  getAllCompanies: asyncHandler(getAllCompanies),
  getCompanyById: asyncHandler(getCompanyById),
  approveCompany: asyncHandler(approveCompany),
  suspendCompany: asyncHandler(suspendCompany),
  rejectCompany: asyncHandler(rejectCompany),
  updateCompany: asyncHandler(updateCompany),
  deleteCompany: asyncHandler(deleteCompany),
};
