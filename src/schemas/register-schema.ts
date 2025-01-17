import z from "zod";

export const registerSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(1, "Password confirmation is required")
      .min(8, "Password must be at least 8 characters"),
    fullname: z.string().min(5, "Fullnmae is required").max(50),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not match",
  });
