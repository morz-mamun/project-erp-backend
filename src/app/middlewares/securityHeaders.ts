import { Request, Response, NextFunction } from "express";

/**
 * Security headers middleware
 * Adds essential security headers to all responses
 * This is a lightweight alternative to helmet.js
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy (basic)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none';",
  );

  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");

  next();
};
