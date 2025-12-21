import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import simplifyError from "../errors/simplifyError";
import sendError from "../errors/sendError";

export default function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      next();
    } catch (error) {
      const errorResponse = simplifyError(error);
      sendError(res, errorResponse);
      next(error);
    }
  };
}
