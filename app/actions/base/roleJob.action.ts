"use server";

import { eq } from "drizzle-orm";
import db from "@/lib/database";
import { roleJobTable } from "@/lib/database/schema";
import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric } from "@/types/auth.type";

export type RoleJob = {
  id: string;
  name: string;
};

export const createRoleJob = async (
  input: { name: string }
): Promise<ActionResultGeneric<RoleJob>> =>
  wrap(async () => {
    const requiredPermission = "roleJob:create";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // Sprawdź czy nazwa już istnieje
    const exists = await db.query.roleJobTable.findFirst({
      where: (r) => eq(r.name, input.name),
    });
    if (exists) {
      return { state: "error", error: "RoleJob with this name already exists" };
    }

    const [newRoleJob] = await db
      .insert(roleJobTable)
      .values({ name: input.name })
      .returning();

    return { state: "success", success: "RoleJob created", data: newRoleJob };
  });

export const getRoleJobById = async (
  id: string
): Promise<ActionResultGeneric<RoleJob>> =>
  wrap(async () => {
    const requiredPermission = "roleJob:read";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const roleJob = await db.query.roleJobTable.findFirst({
      where: (r) => eq(r.id, id),
    });
    if (!roleJob) {
      return { state: "error", error: "RoleJob not found" };
    }

    return { state: "success", success: "RoleJob found", data: roleJob };
  });

export const updateRoleJob = async (
  input: { id: string; name: string }
): Promise<ActionResultGeneric<RoleJob>> =>
  wrap(async () => {
    const requiredPermission = "roleJob:update";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const existing = await db.query.roleJobTable.findFirst({
      where: (r) => eq(r.id, input.id),
    });
    if (!existing) {
      return { state: "error", error: "RoleJob not found" };
    }

    // Sprawdź, czy nowa nazwa nie koliduje (chyba że jest taka sama)
    if (input.name !== existing.name) {
      const nameExists = await db.query.roleJobTable.findFirst({
        where: (r) => eq(r.name, input.name),
      });
      if (nameExists) {
        return { state: "error", error: "RoleJob with this name already exists" };
      }
    }

    const [updatedRoleJob] = await db
      .update(roleJobTable)
      .set({ name: input.name })
      .where(eq(roleJobTable.id, input.id))
      .returning();

    return { state: "success", success: "RoleJob updated", data: updatedRoleJob };
  });

export const deleteRoleJob = async (
  id: string
): Promise<ActionResultGeneric> =>
  wrap(async () => {
    const requiredPermission = "roleJob:delete";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const exists = await db.query.roleJobTable.findFirst({
      where: (r) => eq(r.id, id),
    });
    if (!exists) {
      return { state: "error", error: "RoleJob not found" };
    }

    await db.delete(roleJobTable).where(eq(roleJobTable.id, id));
    return { state: "success", success: "RoleJob deleted" };
  });

export const listRoleJobs = async (): Promise<ActionResultGeneric<RoleJob[]>> =>
  wrap(async () => {
    const requiredPermission = "roleJob:list";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const roles = await db.select().from(roleJobTable);
    return { state: "success", success: "RoleJobs retrieved", data: roles };
  });
