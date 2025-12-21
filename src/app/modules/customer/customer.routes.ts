import { Router } from "express";
import { CustomerController } from "./customer.controller";
import Authentication from "../../middlewares/authentication";
import { authorize, requirePermission } from "../../middlewares/rbac";
import { UserRole } from "../../utils/enum/userRole";
import tenantIsolation from "../../middlewares/tenantIsolation";
import activityLogger from "../../middlewares/activityLogger";

const router = Router();

// Apply authentication and tenant isolation to all routes
router.use(Authentication());
router.use(tenantIsolation);

/**
 * Create customer
 */
router.post(
  "/",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("customer", "create"),
  activityLogger("CREATE_CUSTOMER", "Customer"),
  CustomerController.createCustomer,
);

/**
 * Get all customers
 */
router.get(
  "/",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  CustomerController.getAllCustomers,
);

/**
 * Get customer by ID
 */
router.get(
  "/:id",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  CustomerController.getCustomerById,
);

/**
 * Get customer purchase history
 */
router.get(
  "/:id/history",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  CustomerController.getCustomerPurchaseHistory,
);

/**
 * Update customer
 */
router.patch(
  "/:id",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("customer", "update"),
  activityLogger("UPDATE_CUSTOMER", "Customer"),
  CustomerController.updateCustomer,
);

/**
 * Delete customer
 */
router.delete(
  "/:id",
  authorize(UserRole.COMPANY_ADMIN),
  requirePermission("customer", "delete"),
  activityLogger("DELETE_CUSTOMER", "Customer"),
  CustomerController.deleteCustomer,
);

export const CustomerRoutes = router;
