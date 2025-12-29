import { NextFunction, Request, Response } from "express";
import { UserRole } from "../utils/enum/userRole";
import { TRole } from "../modules/auth/auth.user.interface";

/**
 * Permission matrix defining what each role can do
 */
const PERMISSIONS: Record<TRole, any> = {
  [UserRole.SUPER_ADMIN]: {
    company: ["*"],
    user: ["*"],
    // category: ["*"],
    // brand: ["*"],
    product: ["*"],
    inventory: ["*"],
    sales: ["*"],
    reports: ["*"],
    logs: ["*"],
  },
  [UserRole.COMPANY_ADMIN]: {
    company: ["read", "update"], // Own company only
    user: ["create", "read", "update", "delete"], // Company users
    manager: ["approve", "reject"], // Manager requests
    product: ["create", "read", "update", "delete"],
    category: ["create", "read", "update", "delete"],
    brand: ["create", "read", "update", "delete"],
    inventory: ["create", "read", "update", "delete", "adjust"],
    sales: ["create", "read", "update", "delete", "refund"],
    customer: ["create", "read", "update", "delete"],
    reports: ["read", "export"],
    logs: ["read"], // Company logs only
  },
  [UserRole.MANAGER]: {
    product: ["create", "read", "update"],
    category: ["create", "read", "update"],
    brand: ["create", "read", "update"],
    inventory: ["create", "read", "update", "adjust"],
    sales: ["create", "read", "update"],
    customer: ["create", "read", "update"],
    reports: ["read"],
    user: ["read"], // View only
  },
  [UserRole.USER]: {
    profile: ["read", "update"],
    roleRequest: ["create", "read"],
  },
};

/**
 * Check if user has permission for action on resource
 */
const hasPermission = (
  role: TRole,
  resource: string,
  action: string,
): boolean => {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;

  const resourcePermissions = (rolePermissions as Record<string, string[]>)[
    resource
  ];
  if (!resourcePermissions) return false;

  // Check for wildcard permission
  if (resourcePermissions.includes("*")) return true;

  // Check for specific permission
  return resourcePermissions.includes(action);
};

/**
 * Permission middleware factory
 * Creates middleware to check if user has permission for specific action on resource
 *
 * @param resource - The resource being accessed (e.g., 'product', 'user')
 * @param action - The action being performed (e.g., 'create', 'read', 'update', 'delete')
 *
 * @example
 * router.post('/products',
 *   authenticate,
 *   requirePermission('product', 'create'),
 *   createProduct
 * )
 */
const requirePermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user || {};

    if (!role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No role found",
      });
    }

    if (!hasPermission(role, resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: ${role} cannot ${action} ${resource}`,
      });
    }

    next();
  };
};

/**
 * Authorization middleware factory
 * Simpler version that just checks if user has one of the allowed roles
 *
 * @param allowedRoles - Array of roles that are allowed to access this route
 *
 * @example
 * router.get('/admin/stats',
 *   authenticate,
 *   authorize(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN),
 *   getStats
 * )
 */
const authorize = (...allowedRoles: TRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user || {};

    if (!role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No role found",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: ${role} is not authorized to access this resource`,
      });
    }

    next();
  };
};

export { requirePermission, authorize, hasPermission, PERMISSIONS };
