import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { asyncHandler } from "../../utils/asyncHandler";
import { configuration } from "../../config/config";

/**
 * Login user (Company Admin, Manager, User)
 */
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const result = await AuthService.loginUser(req.body);

  // Set token in HttpOnly cookie (secure, not accessible via JavaScript)
  // Set token in HttpOnly cookie (secure, not accessible via JavaScript)
  const cookieOptions = {
    httpOnly: true,
    secure: configuration.env === "production",
    sameSite: (configuration.env === "production" ? "strict" : "lax") as
      | "strict"
      | "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };

  console.log("DEBUG: Env =", configuration.env);
  console.log("DEBUG: Cookie Options =", cookieOptions);

  res.cookie("auth-token", result.accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Login successful",
    data: {
      user: result.user, // Don't send token in response body
    },
  });
  next();
};

/**
 * Logout user
 */
const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req?.cookies?.["auth-token"];
  if (!token) {
    return next(
      new Error("You are not logged in! Please log in to get access."),
    );
  }

  res.clearCookie("auth-token", {
    httpOnly: true,
    secure: configuration.env === "production",
    sameSite: configuration.env === "production" ? "strict" : "lax",
    path: "/",
  });
  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Logout successful",
  });
  next();
};

/**
 * Update user profile
 */
const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user!;
  const result = await AuthService.updateProfile(userId.toString(), req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
  next();
};

/**
 * Update user password
 */
const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user!;
  const result = await AuthService.updatePassword(userId.toString(), req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Password updated successfully",
    data: result,
  });
  next();
};

/**
 * Soft delete user (deactivate)
 */
const updateDeletedStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const result = await AuthService.updateDeletedStatus(id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "User deactivated successfully",
    data: result,
  });
  next();
};

/**
 * Get all users in company (Company Admin)
 */
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  const { companyId } = req.user!;
  const result = await AuthService.getAllUsers(
    companyId!.toString(),
    req.query as any,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Create new user (Company Admin)
 */
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { companyId } = req.user!;
  const result = await AuthService.createUser(companyId!.toString(), req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "User created successfully",
    data: result,
  });
  next();
};

/**
 * Update user role (Company Admin)
 */
const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const result = await AuthService.updateRole(id, req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "User role updated successfully",
    data: result,
  });
  next();
};

/**
 * Toggle user active status (Company Admin)
 */
const updateActiveStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const result = await AuthService.updateActiveStatus(id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
  next();
};

export const AuthController = {
  loginUser: asyncHandler(loginUser),
  logoutUser: asyncHandler(logoutUser),
  updateProfile: asyncHandler(updateProfile),
  updatePassword: asyncHandler(updatePassword),
  updateDeletedStatus: asyncHandler(updateDeletedStatus),
  getAllUsers: asyncHandler(getAllUsers),
  createUser: asyncHandler(createUser),
  updateRole: asyncHandler(updateRole),
  updateActiveStatus: asyncHandler(updateActiveStatus),
};
