import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, TJwtPayload } from "./auth.user.interface";
import User from "./auth.user.model";
import Company from "../company/company.model";
import { createToken } from "./auth.utils";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { CompanyStatus } from "../../utils/enum/companyStatus";

/**
 * Login user (Company Admin, Manager, User)
 * Multi-tenant: Verifies company is approved and active
 */
const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<{ token: string; user: Partial<IUser> }> => {
  const { email, password } = payload;

  // Find user with password
  const user = await User.findOne({ email })
    .select("+password")
    .populate("companyId");
  if (!user) {
    throw new AppError(httpStatusCode.NOT_FOUND, "User not found");
  }

  // Check if user is active
  if (user.isActive === false) {
    throw new AppError(httpStatusCode.FORBIDDEN, "Your account is deactivated");
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

  // Verify password
  const isPasswordMatched = await user.matchPassword(password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatusCode.UNAUTHORIZED, "Invalid credentials");
  }

  // Generate JWT token
  const jwtPayload: TJwtPayload = {
    email: user.email,
    userId: user._id as mongoose.Types.ObjectId,
    role: user.role,
    companyId: user.companyId as mongoose.Types.ObjectId,
  };

  const token = createToken(jwtPayload);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return {
    token,
    user: user.toProfileJSON(),
  };
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
