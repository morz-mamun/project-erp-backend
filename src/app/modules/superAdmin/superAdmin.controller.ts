import { NextFunction, Request, Response } from "express";
import { SuperAdminService } from "./superAdmin.service";
import sendResponse from "../../utils/sendResponse";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { asyncHandler } from "../../utils/asyncHandler";

/**
 * SuperAdmin login controller
 */
const loginSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await SuperAdminService.loginSuperAdmin(req.body);

  // Set token in cookie
  res.cookie("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Super Admin login successful",
    data: result,
  });
  next();
};

/**
 * Get SuperAdmin profile
 */
const getSuperAdminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user!;
  const result = await SuperAdminService.getSuperAdminProfile(
    userId.toString(),
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Update SuperAdmin profile
 */
const updateSuperAdminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user!;
  const result = await SuperAdminService.updateSuperAdminProfile(
    userId.toString(),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
  next();
};

/**
 * Update SuperAdmin password
 */
const updateSuperAdminPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user!;
  await SuperAdminService.updateSuperAdminPassword(userId.toString(), req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Password updated successfully",
  });
  next();
};

export const SuperAdminController = {
  loginSuperAdmin: asyncHandler(loginSuperAdmin),
  getSuperAdminProfile: asyncHandler(getSuperAdminProfile),
  updateSuperAdminProfile: asyncHandler(updateSuperAdminProfile),
  updateSuperAdminPassword: asyncHandler(updateSuperAdminPassword),
};
