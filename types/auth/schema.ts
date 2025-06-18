import { z } from "zod";
import { usernameSchema, passwordSchema } from "@/types/shared/zod";

export const signInSchema = z.object({
	userName: usernameSchema,
	password: passwordSchema,
});

export const signUpSchema = z.object({
	userName: usernameSchema,
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address"),
	password: passwordSchema,
	confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
});

export const activationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
    pin: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\d{6}$/.test(val),
        "PIN musi zawierać dokładnie 6 cyfr i tylko cyfry"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być takie same",
    path: ["confirmPassword"],
  });