import { Router } from "express";
import { InventoryController } from "./inventory.controller";
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
 * Get inventory
 */
router.get(
  "/",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  InventoryController.getInventory,
);

/**
 * Stock in (purchase/restock)
 */
router.post(
  "/stock-in",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("inventory", "create"),
  activityLogger("STOCK_IN", "Inventory"),
  InventoryController.stockIn,
);

/**
 * Adjust stock
 */
router.post(
  "/adjust",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("inventory", "adjust"),
  activityLogger("ADJUST_STOCK", "Inventory"),
  InventoryController.adjustStock,
);

/**
 * Get stock movements
 */
router.get(
  "/movements",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  InventoryController.getStockMovements,
);

export const InventoryRoutes = router;
