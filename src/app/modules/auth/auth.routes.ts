import { Router } from "express";

import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import Authentication from "../../middlewares/authentication";
import { UserRole } from "../../utils/enum/userRole";

const router = Router();

// * Register a new user
router.post(
  "/register",
  validateRequest(AuthValidation.registerUserZodSchema),
  AuthController.registerUser,
);

// * Login an existing user
router.post("/login", AuthController.loginUser);

// * Logout user
router.post("/logout", AuthController.logoutUser);

// * Update user profile (Accessible to all authenticated users)
router.patch(
  "/update-profile",
  Authentication(UserRole.MANAGER, UserRole.USER, UserRole.ADMIN),
  validateRequest(AuthValidation.updateProfileZodSchema),
  AuthController.updateProfile,
);

// * Update user password (Accessible to all authenticated users)
router.patch(
  "/update-password",
  Authentication(UserRole.MANAGER, UserRole.USER, UserRole.ADMIN),
  AuthController.updatePassword,
);

// * Update user delete status (isDeleted property) (Accessible to MANAGERs and USERs)
router.post(
  "/:id/delete",
  Authentication(UserRole.MANAGER, UserRole.USER),
  AuthController.updateDeletedStatus,
);

// * Retrieve all users (Admin only)
router.get(
  "/getAll",
  Authentication(UserRole.ADMIN),
  AuthController.getAllUsers,
);

// * Update user role (Admin only)
router.patch(
  "/:id/role",
  Authentication(UserRole.ADMIN),
  AuthController.updateRole,
);

// * Update user active status (isActive property) (Admin only)
router.patch(
  "/:id/active",
  Authentication(UserRole.ADMIN),
  AuthController.updateActiveStatus,
);

export const AuthRoutes = router;
