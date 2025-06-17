import type { objectTable } from "@/lib/database/schema/core/core.schema";
import type { InferSelectModel } from "drizzle-orm";
import z from "zod";

export type Organization = InferSelectModel<typeof objectTable>;

export const updateOrganizationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  type: z.string(),
  level: z.number(),
  parentId: z.string().optional(),
});
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;