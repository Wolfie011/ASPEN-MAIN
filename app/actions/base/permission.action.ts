"use server";

import { eq } from "drizzle-orm";
import db from "@/lib/database";
import { permissionTable } from "@/lib/database/schema";
import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric } from "@/types/auth.type";

export type Permission = {
  id: string;
  name: string;
  description: string | null;
};

export const createPermission = async (
  input: { name: string; description?: string }
): Promise<ActionResultGeneric<Permission>> =>
  wrap(async () => {
    const requiredPermission = "permission:create";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // Sprawdź czy nazwa już istnieje
    const exists = await db.query.permissionTable.findFirst({
      where: (p) => eq(p.name, input.name),
    });
    if (exists) {
      return { state: "error", error: "Permission with this name already exists" };
    }

    const [newPermission] = await db
      .insert(permissionTable)
      .values({
        name: input.name,
        description: input.description ?? null,
      })
      .returning();

    return { state: "success", success: "Permission created", data: newPermission };
  });

export const getPermissionById = async (
  id: string
): Promise<ActionResultGeneric<Permission>> =>
  wrap(async () => {
    const requiredPermission = "permission:read";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const permission = await db.query.permissionTable.findFirst({
      where: (p) => eq(p.id, id),
    });
    if (!permission) {
      return { state: "error", error: "Permission not found" };
    }

    return { state: "success", success: "Permission found", data: permission };
  });

export const updatePermission = async (
  input: { id: string; name: string; description?: string }
): Promise<ActionResultGeneric<Permission>> =>
  wrap(async () => {
    const requiredPermission = "permission:update";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const existing = await db.query.permissionTable.findFirst({
      where: (p) => eq(p.id, input.id),
    });
    if (!existing) {
      return { state: "error", error: "Permission not found" };
    }

    // Sprawdź czy nazwa się nie powtarza (chyba że to ta sama nazwa)
    if (input.name !== existing.name) {
      const nameExists = await db.query.permissionTable.findFirst({
        where: (p) => eq(p.name, input.name),
      });
      if (nameExists) {
        return { state: "error", error: "Permission with this name already exists" };
      }
    }

    const [updatedPermission] = await db
      .update(permissionTable)
      .set({
        name: input.name,
        description: input.description ?? null,
      })
      .where(eq(permissionTable.id, input.id))
      .returning();

    return { state: "success", success: "Permission updated", data: updatedPermission };
  });

export const deletePermission = async (
  id: string
): Promise<ActionResultGeneric> =>
  wrap(async () => {
    const requiredPermission = "permission:delete";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const exists = await db.query.permissionTable.findFirst({
      where: (p) => eq(p.id, id),
    });
    if (!exists) {
      return { state: "error", error: "Permission not found" };
    }

    await db.delete(permissionTable).where(eq(permissionTable.id, id));

    return { state: "success", success: "Permission deleted" };
  });

export const listPermissions = async (): Promise<ActionResultGeneric<Permission[]>> =>
  wrap(async () => {
    const requiredPermission = "permission:list";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const permissions = await db.select().from(permissionTable);
    return { state: "success", success: "Permissions retrieved", data: permissions };
  });
