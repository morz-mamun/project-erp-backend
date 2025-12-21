import mongoose from "mongoose";
import { ISuperAdmin } from "./superAdmin.interface";
import SuperAdmin from "./superAdmin.model";
import { createToken } from "../auth/auth.utils";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";

/**
 * SuperAdmin login service
 * @param payload - Email and password
 * @returns Access token and SuperAdmin profile
 */
const loginSuperAdmin = async (payload: {
  email: string;
  password: string;
}): Promise<{ token: string; superAdmin: Partial<ISuperAdmin> }> => {
  const { email, password } = payload;

  // Find SuperAdmin with password
  const superAdmin = await SuperAdmin.findOne({ email }).select("+password");
  if (!superAdmin) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Super Admin not found");
  }

  // Check if active
  if (superAdmin.isActive === false) {
    throw new AppError(httpStatusCode.FORBIDDEN, "Your account is deactivated");
  }

  // Verify password
  const isPasswordMatched = await superAdmin.matchPassword(password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatusCode.UNAUTHORIZED, "Invalid credentials");
  }

  // Generate JWT token
  const jwtPayload = {
    email: superAdmin?.email,
    userId: superAdmin?._id as mongoose.Types.ObjectId,
    role: superAdmin?.role,
    companyId: undefined, // SuperAdmin has no company
  };

  const token = createToken(jwtPayload);

  // Update last login
  superAdmin.lastLogin = new Date();
  await superAdmin.save();

  return {
    token,
    superAdmin: superAdmin.toProfileJSON(),
  };
};

/**
 * Get SuperAdmin profile
 * @param id - SuperAdmin ID
 * @returns SuperAdmin profile
 */
const getSuperAdminProfile = async (
  id: string,
): Promise<Partial<ISuperAdmin>> => {
  const superAdmin = await SuperAdmin.findById(id);
  if (!superAdmin) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Super Admin not found");
  }

  return superAdmin.toProfileJSON();
};

/**
 * Update SuperAdmin profile
 * @param id - SuperAdmin ID
 * @param payload - Update data
 * @returns Updated SuperAdmin profile
 */
const updateSuperAdminProfile = async (
  id: string,
  payload: Partial<ISuperAdmin>,
): Promise<Partial<ISuperAdmin>> => {
  // Prevent role and password updates through this method
  const { role, password, ...updateData } = payload;

  const superAdmin = await SuperAdmin.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!superAdmin) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Super Admin not found");
  }

  return superAdmin.toProfileJSON();
};

/**
 * Update SuperAdmin password
 * @param id - SuperAdmin ID
 * @param payload - Current and new password
 */
const updateSuperAdminPassword = async (
  id: string,
  payload: { currentPassword: string; newPassword: string },
): Promise<void> => {
  const { currentPassword, newPassword } = payload;

  const superAdmin = await SuperAdmin.findById(id).select("+password");
  if (!superAdmin) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Super Admin not found");
  }

  // Verify current password
  const isPasswordMatched = await superAdmin.matchPassword(currentPassword);
  if (!isPasswordMatched) {
    throw new AppError(httpStatusCode.UNAUTHORIZED, "Invalid current password");
  }

  // Update password
  superAdmin.password = newPassword;
  await superAdmin.save();
};

export const SuperAdminService = {
  loginSuperAdmin,
  getSuperAdminProfile,
  updateSuperAdminProfile,
  updateSuperAdminPassword,
};
