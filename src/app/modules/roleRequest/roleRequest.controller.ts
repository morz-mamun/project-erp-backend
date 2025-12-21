import { NextFunction, Request, Response } from "express";
import { RoleRequestService } from "./roleRequest.service";
import sendResponse from "../../utils/sendResponse";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { asyncHandler } from "../../utils/asyncHandler";

/**
 * Create role upgrade request
 */
const createRoleRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId, companyId } = req.user!;
  const result = await RoleRequestService.createRoleRequest(
    userId.toString(),
    companyId!.toString(),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Role upgrade request submitted successfully",
    data: result,
  });
  next();
};

/**
 * Get all role requests (Company Admin)
 */
const getAllRoleRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { companyId } = req.user!;
  const result = await RoleRequestService.getAllRoleRequests(
    companyId!.toString(),
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Role requests retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Get user's own role requests
 */
const getUserRoleRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user!;
  const result = await RoleRequestService.getUserRoleRequests(
    userId.toString(),
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Your role requests retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Approve role request
 */
const approveRoleRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user!;
  const result = await RoleRequestService.approveRoleRequest(
    req.params.id,
    userId.toString(),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Role request approved successfully",
    data: result,
  });
  next();
};

/**
 * Reject role request
 */
const rejectRoleRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user!;
  const result = await RoleRequestService.rejectRoleRequest(
    req.params.id,
    userId.toString(),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Role request rejected",
    data: result,
  });
  next();
};

export const RoleRequestController = {
  createRoleRequest: asyncHandler(createRoleRequest),
  getAllRoleRequests: asyncHandler(getAllRoleRequests),
  getUserRoleRequests: asyncHandler(getUserRoleRequests),
  approveRoleRequest: asyncHandler(approveRoleRequest),
  rejectRoleRequest: asyncHandler(rejectRoleRequest),
};
