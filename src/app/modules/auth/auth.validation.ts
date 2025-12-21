import { z } from "zod";

const registerUserZodSchema = z.object({
  body: z.object({
    // * Name must be at least 5 characters
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    // * Must be a valid email address
    email: z.email({ message: "Invalid email address" }),
    // * Phone number is required (you can adjust the min length as needed)
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" }),
    // * Password must be between 6 and 20 characters
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .max(50, { message: "Password must be at most 50 characters" }),
    // role will be default to user
    role: z.enum(["user", "admin", "manager"]).default("user"),
  }),
});

const updateProfileZodSchema = z.object({
  body: z.object({
    // * Name must be at least 5 characters
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    // * Must be a valid email address
    email: z.email({ message: "Invalid email address" }),
    // * Phone number is required for profile update as well
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" }),
  }),
});

export const AuthValidation = {
  registerUserZodSchema,
  updateProfileZodSchema,
};
