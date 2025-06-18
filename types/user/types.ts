import { InferSelectModel } from "drizzle-orm";
import { roleJobTable, userTable } from "@/lib/database/schema/core/core.schema";
import { updateUserSchema } from "./schema";
import z from "zod";

export type User = InferSelectModel<typeof userTable>;

export type PublicUser = Omit<User, "hashedPassword" | "hashedPin" | "rfidCard">;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type UserDTO = Omit<
  User,
  "hashedPassword" | "hashedPin" | "rfidCard" | "createdAt" | "updatedAt"
> & {
  roleJob: { id: string; tag: string }[];
  permissionRole: { id: string; tag: string }[];
  units: { id: string; tag: string }[];
};

export type roleJob = InferSelectModel<typeof roleJobTable>;
