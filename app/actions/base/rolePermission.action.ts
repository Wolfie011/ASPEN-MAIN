"use server";

import { and, eq } from "drizzle-orm";
import db from "@/lib/database";
import { rolePermissionTable, roleTable, permissionTable } from "@/lib/database/schema";
import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric } from "@/types/auth.type";

export type RolePermission = {
  roleId: string;
  permissionId: string;
};

export const createRolePermission = async (
  input: { roleId: string; permissionId: string }
): Promise<ActionResultGeneric<RolePermission>> =>
  wrap(async () => {
    const requiredPermission = "rolePermission:create";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // Sprawdź, czy rola istnieje
    const roleExists = await db.query.roleTable.findFirst({
      where: (r) => eq(r.id, input.roleId),
    });
    if (!roleExists) {
      return { state: "error", error: "Role not found" };
    }

    // Sprawdź, czy uprawnienie istnieje
    const permissionExists = await db.query.permissionTable.findFirst({
      where: (p) => eq(p.id, input.permissionId),
    });
    if (!permissionExists) {
      return { state: "error", error: "Permission not found" };
    }

    // Sprawdź, czy relacja już nie istnieje
    const exists = await db.query.rolePermissionTable.findFirst({
      where: (rp) =>
        and(eq(rp.roleId, input.roleId), eq(rp.permissionId, input.permissionId)),
    });
    if (exists) {
      return { state: "error", error: "Relation already exists" };
    }

    const [newRel] = await db
      .insert(rolePermissionTable)
      .values({
        roleId: input.roleId,
        permissionId: input.permissionId,
      })
      .returning();

    return { state: "success", success: "RolePermission created", data: newRel };
  });

export const getRolePermissionById = async (
  roleId: string,
  permissionId: string
): Promise<ActionResultGeneric<RolePermission>> =>
  wrap(async () => {
    const requiredPermission = "rolePermission:read";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rel = await db.query.rolePermissionTable.findFirst({
      where: (rp) =>
        and(eq(rp.roleId, roleId), eq(rp.permissionId, permissionId)),
    });
    if (!rel) {
      return { state: "error", error: "RolePermission not found" };
    }

    return { state: "success", success: "RolePermission found", data: rel };
  });

export const deleteRolePermission = async (
  roleId: string,
  permissionId: string
): Promise<ActionResultGeneric> =>
  wrap(async () => {
    const requiredPermission = "rolePermission:delete";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const exists = await db.query.rolePermissionTable.findFirst({
      where: (rp) =>
        and(eq(rp.roleId, roleId), eq(rp.permissionId, permissionId)),
    });
    if (!exists) {
      return { state: "error", error: "RolePermission not found" };
    }

    await db
      .delete(rolePermissionTable)
      .where(
        and(
          eq(rolePermissionTable.roleId, roleId),
          eq(rolePermissionTable.permissionId, permissionId)
        )
      );

    return { state: "success", success: "RolePermission deleted" };
  });

export const listRolePermissions = async (): Promise<
  ActionResultGeneric<RolePermission[]>
> =>
  wrap(async () => {
    const requiredPermission = "rolePermission:list";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rels = await db.select().from(rolePermissionTable);
    return { state: "success", success: "RolePermissions retrieved", data: rels };
  });
