import { Router } from "express";
import { RoleRequestController } from "./roleRequest.controller";
import Authentication from "../../middlewares/authentication";
import { authorize } from "../../middlewares/rbac";
import { UserRole } from "../../utils/enum/userRole";
import tenantIsolation from "../../middlewares/tenantIsolation";
import activityLogger from "../../middlewares/activityLogger";

const router = Router();

// Apply authentication and tenant isolation to all routes
router.use(Authentication());
router.use(tenantIsolation);

/**
 * Create role upgrade request (User only)
 */
router.post(
  "/",
  authorize(UserRole.USER),
  activityLogger("CREATE_ROLE_REQUEST", "RoleRequest"),
  RoleRequestController.createRoleRequest,
);

/**
 * Get user's own role requests
 */
router.get(
  "/my-requests",
  authorize(UserRole.USER),
  RoleRequestController.getUserRoleRequests,
);

/**
 * Get all role requests (Company Admin)
 */
router.get(
  "/",
  authorize(UserRole.COMPANY_ADMIN),
  RoleRequestController.getAllRoleRequests,
);

/**
 * Approve role request (Company Admin)
 */
router.patch(
  "/:id/approve",
  authorize(UserRole.COMPANY_ADMIN),
  activityLogger("APPROVE_ROLE_REQUEST", "RoleRequest"),
  RoleRequestController.approveRoleRequest,
);

/**
 * Reject role request (Company Admin)
 */
router.patch(
  "/:id/reject",
  authorize(UserRole.COMPANY_ADMIN),
  activityLogger("REJECT_ROLE_REQUEST", "RoleRequest"),
  RoleRequestController.rejectRoleRequest,
);

export const RoleRequestRoutes = router;
