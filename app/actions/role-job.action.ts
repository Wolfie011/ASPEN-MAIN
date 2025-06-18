"use server";

import { eq } from "drizzle-orm";
import db from "@/lib/database";
import { roleJobTable } from "@/lib/database/schema/core/core.schema";
import wrap, { authorize, hasPermission } from "@/lib/server-utils";
import { ActionResultGeneric } from "@/types/shared/action-result";
import { roleJob } from "@/types/user/types";

// Stwórz nowy RoleJob
export const createRoleJob = async (
  input: { name: string }
): Promise<ActionResultGeneric<{ id: string; tag: string }>> =>
  wrap(async () => {
    const requiredPermission = "roleJob:create";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

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

    return {
      state: "success",
      success: "RoleJob created",
      data: { id: newRoleJob.id, tag: newRoleJob.name },
    };
  });

// Pobierz RoleJob po ID
export const getRoleJobById = async (
  id: string
): Promise<ActionResultGeneric<{ id: string; tag: string }>> =>
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

    return {
      state: "success",
      success: "RoleJob found",
      data: { id: roleJob.id, tag: roleJob.name },
    };
  });

// Zaktualizuj RoleJob
export const updateRoleJob = async (
  input: { id: string; name: string }
): Promise<ActionResultGeneric<{ id: string; tag: string }>> =>
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

    return {
      state: "success",
      success: "RoleJob updated",
      data: { id: updatedRoleJob.id, tag: updatedRoleJob.name },
    };
  });

// Usuń RoleJob
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

// Pobierz wszystkie RoleJob
export const listRoleJobs = async (): Promise<
  ActionResultGeneric<{ id: string; tag: string }[]>
> =>
  wrap(async () => {
    const requiredPermission = "roleJob:list";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const roles = await db
      .select({
        id: roleJobTable.id,
        tag: roleJobTable.name,
      })
      .from(roleJobTable);

    return {
      state: "success",
      success: "RoleJobs retrieved",
      data: roles,
    };
  });
