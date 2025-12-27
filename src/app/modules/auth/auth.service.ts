import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, TJwtPayload } from "./auth.user.interface";
import User from "./auth.user.model";
import Company from "../company/company.model";
import { createToken } from "./auth.utils";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { CompanyStatus } from "../../utils/enum/companyStatus";

import SuperAdmin from "../superAdmin/superAdmin.model";

/**
 * Login user (Company Admin, Manager, User, Super Admin)
 * Multi-tenant: Verifies company is approved and active for regular users
 */
const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: Partial<IUser> }> => {
  const { email, password } = payload;

  // 1. Check if user exists in User collection
  const user = await User.findOne({ email })
    .select("+password")
    .populate("companyId");

  if (user) {
    // Check if user is active
    if (user.isActive === false) {
      throw new AppError(
        httpStatusCode.FORBIDDEN,
        "Your account is deactivated",
      );
    }

    // Verify company status
    const company = await Company.findById(user.companyId);
    if (!company) {
      throw new AppError(httpStatusCode.NOT_FOUND, "Company not found");
    }

    if (company.status !== CompanyStatus.APPROVED) {
      throw new AppError(
        httpStatusCode.FORBIDDEN,
        "Your company is not approved yet. Please wait for admin approval.",
      );
    }

    if (!company.isActive) {
      throw new AppError(httpStatusCode.FORBIDDEN, "Your company is suspended");
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / (1000 * 60),
      );
      throw new AppError(
        httpStatusCode.FORBIDDEN,
        `Account is locked. Please try again in ${minutesLeft} minute(s).`,
      );
    }

    // Verify password
    const isPasswordMatched = await user.matchPassword(password);
    if (!isPasswordMatched) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        throw new AppError(
          httpStatusCode.FORBIDDEN,
          "Account locked due to too many failed login attempts. Please try again in 15 minutes.",
        );
      }

      await user.save();
      throw new AppError(
        httpStatusCode.UNAUTHORIZED,
        `Invalid credentials. ${5 - user.failedLoginAttempts} attempt(s) remaining.`,
      );
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    // Generate JWT token
    const jwtPayload: TJwtPayload = {
      email: user.email,
      userId: user._id as mongoose.Types.ObjectId,
      role: user.role,
      companyId:
        (user.companyId as any)?._id ||
        (user.companyId as mongoose.Types.ObjectId),
    };

    const token = createToken(jwtPayload);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      accessToken: token,
      user: user.toProfileJSON(),
    };
  }

  // 2. If not in User, check SuperAdmin collection
  const superAdmin = await SuperAdmin.findOne({ email }).select("+password");

  if (superAdmin) {
    // Check if active
    if (!superAdmin.isActive) {
      throw new AppError(
        httpStatusCode.FORBIDDEN,
        "Super Admin account is deactivated",
      );
    }

    // Verify password
    const isPasswordMatched = await superAdmin.matchPassword(password);
    if (!isPasswordMatched) {
      throw new AppError(httpStatusCode.UNAUTHORIZED, "Invalid credentials");
    }

    // Generate JWT token
    const jwtPayload: TJwtPayload = {
      email: superAdmin.email,
      userId: superAdmin._id as mongoose.Types.ObjectId,
      role: superAdmin.role as any, // Cast to any or appropriate role type if needed
      companyId: undefined, // Super Admin has no company
    };

    const token = createToken(jwtPayload);

    // Update last login
    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    return {
      accessToken: token,
      user: superAdmin.toProfileJSON() as any, // Cast to partial IUser for consistency
    };
  }

  // 3. User not found in either collection
  throw new AppError(httpStatusCode.NOT_FOUND, "User not found");
};

/**
 * Update user profile
 */
const updateProfile = async (
  id: string,
  payload: Partial<IUser>,
): Promise<Partial<IUser>> => {
  // Prevent role, companyId, and password updates through this method
  const { role, companyId, password, ...updateData } = payload;

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updatedUser) {
    throw new AppError(httpStatusCode.NOT_FOUND, "User not found");
  }

  return updatedUser.toProfileJSON();
};

/**
 * Update user password
 */
const updatePassword = async (
  id: string,
  payload: { currentPassword: string; newPassword: string },
): Promise<IUser> => {
  const { currentPassword, newPassword } = payload;

  const user = await User.findById(id).select("+password");
  if (!user) {
    throw new AppError(httpStatusCode.NOT_FOUND, "User not found");
  }

  // Verify current password
  const isPasswordMatched = await bcrypt.compare(
    currentPassword,
    user.password,
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatusCode.UNAUTHORIZED, "Invalid credentials");
  }

  // Hash new password and update
  const salt = await bcrypt.genSalt(10);
  const updatedPassword = await bcrypt.hash(newPassword, salt);
  await User.findByIdAndUpdate(
    id,
    { password: updatedPassword },
    { new: true },
  );

  // Fetch the updated user and verify new password
  const updatedUser = await User.findById(id).select("+password");
  if (!updatedUser) {
    throw new AppError(httpStatusCode.NOT_FOUND, "User not found");
  }

  const passwordMatch = await updatedUser.matchPassword(newPassword);
  if (!passwordMatch) {
    throw new AppError(
      httpStatusCode.INTERNAL_SERVER_ERROR,
      "Password update failed",
    );
  }

  return updatedUser;
};

/**
 * Soft delete user (deactivate)
 */
const updateDeletedStatus = async (id: string): Promise<IUser> => {
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  if (!updatedUser) {
    throw new AppError(httpStatusCode.NOT_FOUND, "User not found");
  }
  return updatedUser;
};

/**
 * Get all users in company (Company Admin only)
 */
const getAllUsers = async (
  companyId: string,
  queryOptions: {
    email?: string;
    role?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<{
  users: IUser[];
  metadata: { total: number; page: number; limit: number };
}> => {
  const { email, role, page = 1, limit = 10 } = queryOptions;
  const filter: any = { companyId };

  if (email) {
    filter.email = { $regex: email, $options: "i" };
  }
  if (role) {
    filter.role = role;
  }

  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await User.countDocuments(filter);

  return {
    users,
    metadata: {
      total,
      page,
      limit,
    },
  };
};

/**
 * Update user role (Company Admin only)
 */
const updateRole = async (
  id: string,
  payload: { role: any },
): Promise<IUser> => {
  const updatedUser = await User.findByIdAndUpdate(id, payload, { new: true });
  if (!updatedUser) {
    throw new AppError(httpStatusCode.NOT_FOUND, "User not found");
  }
  return updatedUser;
};

/**
 * Toggle user active status (Company Admin only)
 */
const updateActiveStatus = async (id: string): Promise<IUser> => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatusCode.NOT_FOUND, "User not found");
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { isActive: !user.isActive },
    { new: true },
  );
  if (!updatedUser) {
    throw new AppError(httpStatusCode.NOT_FOUND, "User not found");
  }
  return updatedUser;
};

/**
 * Create new user (Company Admin only)
 */
const createUser = async (
  companyId: string,
  payload: Partial<IUser>,
): Promise<Partial<IUser>> => {
  const user = await User.create({
    ...payload,
    companyId,
  });

  return user.toProfileJSON();
};

export const AuthService = {
  loginUser,
  updateProfile,
  updatePassword,
  updateDeletedStatus,
  getAllUsers,
  updateRole,
  updateActiveStatus,
  createUser,
};
