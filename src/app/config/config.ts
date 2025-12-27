import dotenv from "dotenv";

// ** Load Environment Variables **
dotenv.config({ path: ".env" });

// ** Validate Critical Environment Variables **
if (!process.env.JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is required! " +
      "Please set it in your .env file with a strong random string.",
  );
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "FATAL: DATABASE_URL environment variable is required! " +
      "Please set it in your .env file.",
  );
}

export const configuration = {
  env: process.env.NODE_ENV ?? "development",
  port: process.env.PORT ?? 5000,
  mongo: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  corsOrigin: process.env.CORS_ORIGIN,
};
