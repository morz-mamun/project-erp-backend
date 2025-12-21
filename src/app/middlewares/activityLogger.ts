import { NextFunction, Request, Response } from "express";
import ActivityLog from "../modules/activityLog/activityLog.model";

/**
 * Sanitize sensitive data before logging
 */
const sanitizeLogData = (data: any): any => {
  if (!data) return data;

  const sanitized = { ...data };
  const sensitiveFields = [
    "password",
    "token",
    "refreshToken",
    "creditCard",
    "cvv",
  ];

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
};

/**
 * Activity Logger Middleware Factory
 * Logs all state-changing operations for audit trail
 *
 * @param action - The action being performed (e.g., 'CREATE_PRODUCT', 'UPDATE_STOCK')
 * @param resource - The resource type (e.g., 'Product', 'Inventory')
 *
 * @example
 * router.post('/products',
 *   authenticate,
 *   authorize(UserRole.COMPANY_ADMIN, UserRole.MANAGER),
 *   activityLogger('CREATE_PRODUCT', 'Product'),
 *   createProduct
 * )
 */
const activityLogger = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function to log after successful response
    res.send = function (data: any) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log activity asynchronously (don't block response)
        ActivityLog.create({
          companyId: req.user?.companyId || undefined,
          userId: req.user?.userId,
          action,
          resource,
          resourceId: req.params.id || req.body._id,
          details: {
            method: req.method,
            path: req.path,
            body: sanitizeLogData(req.body),
            query: req.query,
          },
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          timestamp: new Date(),
        }).catch((err) => {
          console.error("Failed to log activity:", err);
        });
      }

      // Call original send function
      return originalSend.call(this, data);
    };

    next();
  };
};

export default activityLogger;
