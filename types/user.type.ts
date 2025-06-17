import type { userTable } from "@/lib/database/schema/core/core.schema";
import type { InferSelectModel } from "drizzle-orm";
import z from "zod";

export type User = InferSelectModel<typeof userTable>;

// Public type (safe for frontend or API clients)
export type PublicUser = Omit<
	User,
	"hashedPassword" | "hashedPin" | "rfidCard"
>;

export const updateUserSchema = z.object({
    id: z.string(),
    userName: z.string().min(1, 'Username is required').optional(),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    roleJob: z.array(z.object({value: z.string(), label: z.string()})).optional(),
    permissionRole: z.array(z.object({value: z.string(), label: z.string()})).optional(),
})
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Utility: map full user to public user
export function toPublicUser(user: User): PublicUser {
	// Just omit sensitive fields using destructuring
	// (TypeScript will enforce the omission)
	const { hashedPassword, hashedPin, rfidCard, ...publicUser } = user;
	return publicUser;
}
