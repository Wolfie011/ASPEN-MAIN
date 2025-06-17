import { z } from "zod";

// Shared username and password schema
export const usernameSchema = z
	.string()
	.min(3, "Username must be at least 3 characters")
	.max(68, "Username must be at most 68 characters");

export const passwordSchema = z
	.string()
	.min(3, "Password must be at least 3 characters")
	.max(68, "Password must be at most 68 characters");

// Sign-in schema
export const signInSchema = z.object({
	userName: usernameSchema,
	password: passwordSchema,
});

// Sign-up schema (with confirmPassword)
export const signUpSchema = z
	.object({
		userName: usernameSchema,
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		email: z.string().email("Invalid email address"),
		password: passwordSchema,
		confirmPassword: passwordSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"], // this will highlight the confirmPassword field
	});

// Types for easy use elsewhere in your app
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Payload for account activation (setting password and optional PIN)
 */
export const activationSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: passwordSchema,
		pin: z
			.string()
			.length(6, { message: "PIN musi zawierać dokładnie 6 cyfr" })
			.regex(/^\d{6}$/, { message: "PIN może zawierać tylko cyfry" })
			.optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Hasła muszą być takie same",
		path: ["confirmPassword"],
	});
export type activationInput = z.infer<typeof activationSchema>;

export interface ActionResultGeneric<T = void> extends ActionResult {
	/** The payload returned on success (e.g. a User, an array, etc.). */
	data?: T;
	/** Optional success message. */
	message?: string;
	/** Optional success status. */
	state?: string;
}

/**
 * Result of any auth action
 */
export interface ActionResult {
	success?: string;
	error?: string;
	data?: any;
}
