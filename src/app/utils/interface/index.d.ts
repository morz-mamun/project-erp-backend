import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { TRole } from "../../modules/auth/auth.user.interface";

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
