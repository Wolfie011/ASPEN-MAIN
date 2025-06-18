import { z } from "zod";

export const updateOrganizationSchema = z.object({
	id: z.string(),
	name: z.string().min(1, 'Name is required').optional(),
	description: z.string().optional(),
	type: z.string(),
	level: z.number(),
	parentId: z.string().optional(),
});
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const createObjectSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["Organization", "Unit", "Room", "Bed"]),
  level: z.number().min(0, "Wartość minimalna 0 (Root)").int(),
  description: z.string().max(255).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});
export type CreateObjectInput = z.infer<typeof createObjectSchema>;

