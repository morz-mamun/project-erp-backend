import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { TJwtPayload } from "../modules/auth/auth.user.interface";
import { UserRole } from "../utils/enum/userRole";
import AppError from "../errors/functions/AppError";
import { httpStatusCode } from "../utils/enum/statusCode";
import { verifyToken } from "../modules/auth/auth.utils";
import User from "../modules/auth/auth.user.model";
import SuperAdmin from "../modules/superAdmin/superAdmin.model";
import simplifyError from "../errors/simplifyError";
import sendError from "../errors/sendError";

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user data to request
 * Supports both SuperAdmin and regular users (Company Admin, Manager, User)
 */
export default function Authentication() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // * Step 1: Extract token from cookie (preferred) or Authorization header (fallback)
      let token: string | undefined;

      // Try cookie first (HttpOnly - more secure)
      token = req.cookies?.["auth-token"];

      // Fallback to Authorization header for backward compatibility
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        }
      }

      // Check if token exists
      if (!token) {
        throw new AppError(
          httpStatusCode.UNAUTHORIZED,
          "You are not authorized!",
        );
      }

      // * Step 2: Verify the token
      const decoded = verifyToken(token) as TJwtPayload;

      if (!decoded) {
        throw new AppError(httpStatusCode.UNAUTHORIZED, "Invalid token!");
      }

      // * Validate the token payload
      const { email, userId, role, companyId } = decoded;
      if (!email) {
        throw new AppError(
          httpStatusCode.UNAUTHORIZED,
          "Invalid email in token!",
        );
      }

      if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new AppError(
          httpStatusCode.UNAUTHORIZED,
          "Invalid userId in token!",
        );
      }

      if (!role) {
        throw new AppError(
          httpStatusCode.UNAUTHORIZED,
          "Missing role in token!",
        );
      }

      // * Check if the user exists based on role
      let user: any;

      if (role === UserRole.SUPER_ADMIN) {
        // Check SuperAdmin model
        user = await SuperAdmin.findById(userId);
        if (!user) {
          throw new AppError(
            httpStatusCode.NOT_FOUND,
            "Super Admin not found!",
          );
        }
      } else {
        // Check regular User model
        user = await User.findById(userId);

        if (!user) {
          throw new AppError(
            httpStatusCode.NOT_FOUND,
            "This user is not found!",
          );
        }

        // Verify companyId for non-super-admin users
        if (!companyId) {
          throw new AppError(
            httpStatusCode.UNAUTHORIZED,
            "User must be associated with a company!",
          );
        }
      }

      // * Check if the user is active
      if (user.isActive === false) {
        throw new AppError(
          httpStatusCode.FORBIDDEN,
          "Your account is deactivated!",
        );
      }

      // * Attach user information to the request object
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        companyId: decoded.companyId,
      };

      // * Move to the next middleware
      next();
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        const error = new AppError(
          httpStatusCode.UNAUTHORIZED,
          err.message || "Invalid token pls login again!",
        );
        const errorResponse = simplifyError(error);
        sendError(res, errorResponse);
        next(error);
      } else {
        const errorResponse = simplifyError(err);
        sendError(res, errorResponse);
        next(err);
      }
    }
  };
}
