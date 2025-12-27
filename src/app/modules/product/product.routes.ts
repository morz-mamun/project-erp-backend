import { Router } from "express";
import { ProductController } from "./product.controller";
import Authentication from "../../middlewares/authentication";
import { authorize, requirePermission } from "../../middlewares/rbac";
import { UserRole } from "../../utils/enum/userRole";
import tenantIsolation from "../../middlewares/tenantIsolation";
import activityLogger from "../../middlewares/activityLogger";

const router = Router();

// Apply authentication and tenant isolation to all routes
router.use(Authentication());
router.use(tenantIsolation);

import { upload } from "../../middlewares/upload.middleware";

// ============ CATEGORY ROUTES ============

/**
 * Create category
 */
router.post(
  "/categories",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("category", "create"),
  activityLogger("CREATE_CATEGORY", "Category"),
  ProductController.createCategory,
);

/**
 * Get all categories
 */
router.get(
  "/categories",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  ProductController.getAllCategories,
);

/**
 * Update category
 */
router.patch(
  "/categories/:id",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("category", "update"),
  activityLogger("UPDATE_CATEGORY", "Category"),
  ProductController.updateCategory,
);

/**
 * Delete category
 */
router.delete(
  "/categories/:id",
  authorize(UserRole.COMPANY_ADMIN),
  requirePermission("category", "delete"),
  activityLogger("DELETE_CATEGORY", "Category"),
  ProductController.deleteCategory,
);

/**
 * Toggle category status (activate/deactivate)
 */
router.patch(
  "/categories/:id/toggle-status",
  authorize(UserRole.COMPANY_ADMIN),
  requirePermission("category", "update"),
  activityLogger("TOGGLE_CATEGORY_STATUS", "Category"),
  ProductController.toggleCategoryStatus,
);

// ============ BRAND ROUTES ============

/**
 * Create brand
 */
router.post(
  "/brands",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("brand", "create"),
  activityLogger("CREATE_BRAND", "Brand"),
  ProductController.createBrand,
);

/**
 * Get all brands
 */
router.get(
  "/brands",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  ProductController.getAllBrands,
);

/**
 * Update brand
 */
router.patch(
  "/brands/:id",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("brand", "update"),
  activityLogger("UPDATE_BRAND", "Brand"),
  ProductController.updateBrand,
);

/**
 * Delete brand
 */
router.delete(
  "/brands/:id",
  authorize(UserRole.COMPANY_ADMIN),
  requirePermission("brand", "delete"),
  activityLogger("DELETE_BRAND", "Brand"),
  ProductController.deleteBrand,
);

/**
 * Toggle brand status (activate/deactivate)
 */
router.patch(
  "/brands/:id/toggle-status",
  authorize(UserRole.COMPANY_ADMIN),
  requirePermission("brand", "update"),
  activityLogger("TOGGLE_BRAND_STATUS", "Brand"),
  ProductController.toggleBrandStatus,
);

// ============ PRODUCT ROUTES ============

/**
 * Create product
 */
router.post(
  "/",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("product", "create"),
  activityLogger("CREATE_PRODUCT", "Product"),
  upload.array("images", 5),
  ProductController.createProduct,
);

/**
 * Get all products
 */
router.get(
  "/",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  ProductController.getAllProducts,
);

/**
 * Get product by ID
 */
router.get(
  "/:id",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  ProductController.getProductById,
);

/**
 * Update product
 */
router.patch(
  "/:id",
  authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
  requirePermission("product", "update"),
  activityLogger("UPDATE_PRODUCT", "Product"),
  ProductController.updateProduct,
);

/**
 * Delete product
 */
router.delete(
  "/:id",
  authorize(UserRole.COMPANY_ADMIN),
  requirePermission("product", "delete"),
  activityLogger("DELETE_PRODUCT", "Product"),
  ProductController.deleteProduct,
);

export const ProductRoutes = router;
