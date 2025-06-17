// File: app/actions/base/role.action.ts

"use server";

import { eq } from "drizzle-orm";
import db from "@/lib/database";
import { roleTable } from "@/lib/database/schema/core/core.schema";
import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric } from "@/types/auth.type";

export type Role = {
  id: string;
  name: string;
  description: string | null;
};

export const createRole = async (
  input: { name: string; description?: string }
): Promise<ActionResultGeneric<Role>> =>
  wrap(async () => {
    const requiredPermission = "role:create";
    const { user: authUser } = await authorize();
    if (!authUser) {
      return { state: "error", error: "Authentication required" };
    }
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // Sprawdź, czy nazwa roli już istnieje
    const exists = await db.query.roleTable.findFirst({
      where: (r) => eq(r.name, input.name),
    });
    if (exists) {
      return { state: "error", error: "Role with this name already exists" };
    }

    // Wstaw nową rolę
    const [inserted] = await db
      .insert(roleTable)
      .values({
        name: input.name,
        description: input.description ?? null,
      })
      .returning({ id: roleTable.id, name: roleTable.name, description: roleTable.description });

    if (!inserted) {
      return { state: "error", error: "Failed to create role" };
    }

    return {
      state: "success",
      success: "Role created successfully",
      data: {
        id: inserted.id,
        name: inserted.name,
        description: inserted.description,
      },
    };
  });

export const getRoleById = async (
  id: string
): Promise<ActionResultGeneric<Role>> =>
  wrap(async () => {
    const requiredPermission = "role:read";
    const { user: authUser } = await authorize();
    if (!authUser) {
      return { state: "error", error: "Authentication required" };
    }
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const found = await db.query.roleTable.findFirst({
      where: (r) => eq(r.id, id),
    });
    if (!found) {
      return { state: "error", error: "Role not found" };
    }

    return {
      state: "success",
      success: "Role retrieved",
      data: {
        id: found.id,
        name: found.name,
        description: found.description,
      },
    };
  });

export const updateRole = async (
  input: { id: string; name: string; description?: string }
): Promise<ActionResultGeneric<Role>> =>
  wrap(async () => {
    const requiredPermission = "role:update";
    const { user: authUser } = await authorize();
    if (!authUser) {
      return { state: "error", error: "Authentication required" };
    }
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // Sprawdź, czy rola istnieje
    const existing = await db.query.roleTable.findFirst({
      where: (r) => eq(r.id, input.id),
    });
    if (!existing) {
      return { state: "error", error: "Role not found" };
    }

    // Sprawdź unikalność nazwy, jeśli podano nową
    if (input.name && input.name !== existing.name) {
      const nameExists = await db.query.roleTable.findFirst({
        where: (r) => eq(r.name, input.name),
      });
      if (nameExists) {
        return { state: "error", error: "Role with this name already exists" };
      }
    }

    // Przygotuj dane do update
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;

    // Wykonaj aktualizację
    const [updated] = await db
      .update(roleTable)
      .set(updateData)
      .where(eq(roleTable.id, input.id))
      .returning({ id: roleTable.id, name: roleTable.name, description: roleTable.description });

    if (!updated) {
      return { state: "error", error: "Failed to update role" };
    }

    return {
      state: "success",
      success: "Role updated successfully",
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
      },
    };
  });

export const deleteRole = async (
  id: string
): Promise<ActionResultGeneric> =>
  wrap(async () => {
    const requiredPermission = "role:delete";
    const { user: authUser } = await authorize();
    if (!authUser) {
      return { state: "error", error: "Authentication required" };
    }
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // Sprawdź, czy rola istnieje
    const existing = await db.query.roleTable.findFirst({
      where: (r) => eq(r.id, id),
    });
    if (!existing) {
      return { state: "error", error: "Role not found" };
    }

    await db.delete(roleTable).where(eq(roleTable.id, id));
    return {
      state: "success",
      success: "Role deleted successfully",
    };
  });

export const listRoles = async (): Promise<ActionResultGeneric<Role[]>> =>
  wrap(async () => {
    const requiredPermission = "role:list";
    const { user: authUser } = await authorize();
    if (!authUser) {
      return { state: "error", error: "Authentication required" };
    }
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rows = await db.select().from(roleTable);
    const data: Role[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
    }));
    return {
      state: "success",
      success: "Roles retrieved successfully",
      data,
    };
  });
