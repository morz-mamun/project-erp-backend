import { Router } from "express";
import { SuperAdminController } from "./superAdmin.controller";
import Authentication from "../../middlewares/authentication";
import { UserRole } from "../../utils/enum/userRole";

const router = Router();

/**
 * SuperAdmin login (public)
 */
router.post("/login", SuperAdminController.loginSuperAdmin);

/**
 * Get SuperAdmin profile (authenticated)
 */
router.get(
  "/profile",
  Authentication(),
  SuperAdminController.getSuperAdminProfile,
);

/**
 * Update SuperAdmin profile (authenticated)
 */
router.patch(
  "/profile",
  Authentication(),
  SuperAdminController.updateSuperAdminProfile,
);

/**
 * Update SuperAdmin password (authenticated)
 */
router.patch(
  "/password",
  Authentication(),
  SuperAdminController.updateSuperAdminPassword,
);

export const SuperAdminRoutes = router;
