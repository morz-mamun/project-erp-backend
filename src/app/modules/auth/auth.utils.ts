import jwt from "jsonwebtoken";
import ms from "ms";

import { TJwtPayload } from "./auth.user.interface";
import { configuration } from "../../config/config";

const secret = configuration.jwt.secret as string;
const expiresIn = configuration.jwt.expiresIn as string;

export const createToken = (jwtPayload: TJwtPayload) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: Math.floor(ms(expiresIn as ms.StringValue) / 1000),
  });
};

export const verifyToken = (token: string) => jwt.verify(token, secret);
