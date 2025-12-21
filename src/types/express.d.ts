import mongoose from "mongoose";
import { TRole } from "../app/modules/auth/auth.user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: mongoose.Types.ObjectId;
        email: string;
        role: TRole;
        companyId?: mongoose.Types.ObjectId;
      };
      tenantFilter: Record<string, any>;
    }
  }
}

export {};
