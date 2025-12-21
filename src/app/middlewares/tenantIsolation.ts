import { NextFunction, Request, Response } from "express";
import { UserRole } from "../utils/enum/userRole";

/**
 * Tenant Isolation Middleware
 * Enforces company-level data isolation for all queries
 * Super Admin bypasses isolation and can access all companies
 * All other roles can only access data from their company
 */
const tenantIsolation = (req: Request, res: Response, next: NextFunction) => {
  const { role, companyId } = req.user || {};

  // Super Admin: No restrictions, can access all companies
  if (role === UserRole.SUPER_ADMIN) {
    req.tenantFilter = {};
    return next();
  }

  // All other roles: Enforce companyId filter
  if (!companyId) {
    return res.status(403).json({
      success: false,
      message: "User not associated with any company",
    });
  }

  // Set tenant filter to be used in controllers
  req.tenantFilter = { companyId };

  next();
};

export default tenantIsolation;
