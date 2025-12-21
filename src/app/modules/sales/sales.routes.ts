import { Router } from "express";
import { SalesController } from "./sales.controller";
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
 * Create invoice
 */
router.post(
  "/",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("sales", "create"),
  activityLogger("CREATE_INVOICE", "Invoice"),
  SalesController.createInvoice,
);

/**
 * Get all invoices
 */
router.get(
  "/",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  SalesController.getAllInvoices,
);

/**
 * Get invoice by ID
 */
router.get(
  "/:id",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  SalesController.getInvoiceById,
);

/**
 * Cancel invoice
 */
router.patch(
  "/:id/cancel",
  authorize(UserRole.COMPANY_ADMIN),
  activityLogger("CANCEL_INVOICE", "Invoice"),
  SalesController.cancelInvoice,
);

/**
 * Refund invoice
 */
router.patch(
  "/:id/refund",
  authorize(UserRole.COMPANY_ADMIN),
  requirePermission("sales", "refund"),
  activityLogger("REFUND_INVOICE", "Invoice"),
  SalesController.refundInvoice,
);

export const SalesRoutes = router;
