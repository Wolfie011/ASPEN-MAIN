import { z } from "zod";

export const usernameSchema = z
	.string()
	.min(3, "Username must be at least 3 characters")
	.max(68, "Username must be at most 68 characters");

export const passwordSchema = z
	.string()
	.min(3, "Password must be at least 3 characters")
	.max(68, "Password must be at most 68 characters");
