import { z } from "zod";

export const updateUserSchema = z.object({
	id: z.string(),
	userName: z.string().min(1, 'Username is required').optional(),
	firstName: z.string().min(1, 'First name is required').optional(),
	lastName: z.string().min(1, 'Last name is required').optional(),
	email: z.string().email('Invalid email address').optional(),
	phone: z.string().optional(),
	roleJob: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
	permissionRole: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
});
