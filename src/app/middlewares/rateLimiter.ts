import { Request, Response, NextFunction } from "express";

/**
 * Simple in-memory rate limiter
 * Tracks login attempts by IP address
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of loginAttempts.entries()) {
      if (now > entry.resetTime) {
        loginAttempts.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
);

/**
 * Rate limiter for login endpoint
 * Allows 5 attempts per 10 minutes per IP
 */
export const loginRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 5;

  let entry = loginAttempts.get(ip);

  // Create new entry if doesn't exist or window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    loginAttempts.set(ip, entry);
    return next();
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > maxAttempts) {
    const minutesLeft = Math.ceil((entry.resetTime - now) / (1000 * 60));
    return res.status(429).json({
      success: false,
      statusCode: 429,
      message: `Too many login attempts. Please try again in ${minutesLeft} minute(s).`,
    });
  }

  next();
};
