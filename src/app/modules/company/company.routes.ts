import { Router } from "express";
import { CompanyController } from "./company.controller";
import Authentication from "../../middlewares/authentication";
import { authorize } from "../../middlewares/rbac";
import { UserRole } from "../../utils/enum/userRole";
import activityLogger from "../../middlewares/activityLogger";

const router = Router();

/**
 * Register new company (public)
 */
router.post("/register", CompanyController.registerCompany);

/**
 * Get all companies (Super Admin only)
 */
router.get(
  "/",
  Authentication(),
  authorize(UserRole.SUPER_ADMIN),
  CompanyController.getAllCompanies,
);

/**
 * Get company by ID
 */
router.get("/:id", Authentication(), CompanyController.getCompanyById);

/**
 * Approve company (Super Admin only)
 */
router.patch(
  "/:id/approve",
  Authentication(),
  authorize(UserRole.SUPER_ADMIN),
  activityLogger("APPROVE_COMPANY", "Company"),
  CompanyController.approveCompany,
);

/**
 * Suspend company (Super Admin only)
 */
router.patch(
  "/:id/suspend",
  Authentication(),
  authorize(UserRole.SUPER_ADMIN),
  activityLogger("SUSPEND_COMPANY", "Company"),
  CompanyController.suspendCompany,
);

/**
 * Reject company (Super Admin only)
 */
router.patch(
  "/:id/reject",
  Authentication(),
  authorize(UserRole.SUPER_ADMIN),
  activityLogger("REJECT_COMPANY", "Company"),
  CompanyController.rejectCompany,
);

/**
 * Update company
 */
router.patch(
  "/:id",
  Authentication(),
  authorize(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN),
  activityLogger("UPDATE_COMPANY", "Company"),
  CompanyController.updateCompany,
);

/**
 * Delete company (Super Admin only)
 */
router.delete(
  "/:id",
  Authentication(),
  authorize(UserRole.SUPER_ADMIN),
  activityLogger("DELETE_COMPANY", "Company"),
  CompanyController.deleteCompany,
);

export const CompanyRoutes = router;
