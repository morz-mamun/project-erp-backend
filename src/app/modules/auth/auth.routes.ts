import { Router } from "express";
import { AuthController } from "./auth.controller";
import Authentication from "../../middlewares/authentication";
import { authorize } from "../../middlewares/rbac";
import { UserRole } from "../../utils/enum/userRole";
import activityLogger from "../../middlewares/activityLogger";
import { loginRateLimiter } from "../../middlewares/rateLimiter";

const router = Router();

/**
 * Login user (public)
 * Rate limited to 5 attempts per 15 minutes per IP
 */
router.post("/login", loginRateLimiter, AuthController.loginUser);

/**
 * Logout user
 */
router.post("/logout", AuthController.logoutUser);

/**
 * Update user profile (authenticated)
 */
router.patch(
  "/profile",
  Authentication(),
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.USER),
  activityLogger("UPDATE_PROFILE", "User"),
  AuthController.updateProfile,
);

/**
 * Update user password (authenticated)
 */
router.patch(
  "/password",
  Authentication(),
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.USER),
  AuthController.updatePassword,
);

/**
 * Get all users in company (Company Admin)
 */
router.get(
  "/users",
  Authentication(),
  authorize(UserRole.COMPANY_ADMIN),
  AuthController.getAllUsers,
);

/**
 * Create new user (Company Admin)
 */
router.post(
  "/users",
  Authentication(),
  authorize(UserRole.COMPANY_ADMIN),
  activityLogger("CREATE_USER", "User"),
  AuthController.createUser,
);

/**
 * Update user role (Company Admin)
 */
router.patch(
  "/users/:id/role",
  Authentication(),
  authorize(UserRole.COMPANY_ADMIN),
  activityLogger("UPDATE_USER_ROLE", "User"),
  AuthController.updateRole,
);

/**
 * Toggle user active status (Company Admin)
 */
router.patch(
  "/users/:id/active",
  Authentication(),
  authorize(UserRole.COMPANY_ADMIN),
  activityLogger("UPDATE_USER_STATUS", "User"),
  AuthController.updateActiveStatus,
);

/**
 * Soft delete user (Company Admin, Manager)
 */
router.post(
  "/users/:id/delete",
  Authentication(),
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  activityLogger("DELETE_USER", "User"),
  AuthController.updateDeletedStatus,
);

export const AuthRoutes = router;
