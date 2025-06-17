"use server";

import { eq, and } from "drizzle-orm";
import db from "@/lib/database";
import {
  roleTable,
  permissionTable,
  rolePermissionTable,
} from "@/lib/database/schema";

import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric } from "@/types/auth.type";

export type UserRole = {
  id: string;
  tag: string;
};

export type RolePermission = {
  permission: string;
  permissionDescription: string;
  roles: Array<{ id: string; tag: string; hasPermission: boolean }>;
};

// LIST ALL ROLES
export const listRoles = async (): Promise<ActionResultGeneric<UserRole[]>> =>
  wrap(async () => {
    const requiredPermission = "role:read";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rows = await db
      .select({
        id: roleTable.id,
        tag: roleTable.name,
      })
      .from(roleTable);

    return {
      state: "success",
      success: rows.length ? "Roles retrieved" : "No roles found",
      data: rows,
    };
  });

// LIST ALL PERMISSIONS
export const listPermissions = async (): Promise<
  ActionResultGeneric<UserRole[]>
> =>
  wrap(async () => {
    const requiredPermission = "permission:read";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rows = await db
      .select({
        id: permissionTable.id,
        tag: permissionTable.name,
      })
      .from(permissionTable);

    return {
      state: "success",
      success: rows.length
        ? "Permissions retrieved"
        : "No permissions found",
      data: rows,
    };
  });

// LIST ROLE ⟷ PERMISSION MATRIX
export const listRolePermissions = async (): Promise<
  ActionResultGeneric<RolePermission[]>
> =>
  wrap(async () => {
    const requiredPermission = "permission:read";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // 1) fetch all roles & permissions
    const [roles, permissions, mappings] = await Promise.all([
      db.select().from(roleTable),
      db.select().from(permissionTable),
      db.select().from(rolePermissionTable),
    ]);

    // 2) build matrix
    const data: RolePermission[] = permissions.map((perm) => ({
      permission: perm.name,
      permissionDescription: perm.description ?? "",
      roles: roles.map((role) => ({
        id: role.id,
        tag: role.name,
        hasPermission: mappings.some(
          (m) =>
            m.roleId === role.id && m.permissionId === perm.id
        ),
      })),
    }));

    return {
      state: "success",
      success: "Role-Permission matrix retrieved",
      data,
    };
  });

// CREATE NEW ROLE
export const createRole = async (input: {
  name: string;
  description?: string;
}): Promise<ActionResultGeneric<UserRole>> =>
  wrap(async () => {
    const requiredPermission = "role:create";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const [newRole] = await db
      .insert(roleTable)
      .values({
        name: input.name,
        description: input.description ?? null,
      })
      .returning({
        id: roleTable.id,
        tag: roleTable.name,
      });

    if (!newRole) {
      return { state: "error", error: "Failed to create role" };
    }

    return { state: "success", success: "Role created", data: newRole };
  });

// ASSIGN / UNASSIGN PERMISSION TO ROLE
export const updateRolePermission = async (input: {
  roleId: string;
  permissionId: string;
  assigned: boolean;
}): Promise<ActionResultGeneric> =>
  wrap(async () => {
    const requiredPermission = "permission:assign";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // ensure permission exists
    const [perm] = await db
      .select({ id: permissionTable.id })
      .from(permissionTable)
      .where(eq(permissionTable.id, input.permissionId))
      .limit(1);

    if (!perm) {
      return { state: "error", error: "Permission not found" };
    }

    if (input.assigned) {
      await db
        .insert(rolePermissionTable)
        .values({
          roleId: input.roleId,
          permissionId: perm.id,
        })
        .onConflictDoNothing();
      return { state: "success", success: "Permission assigned" };
    } else {
      await db
        .delete(rolePermissionTable)
        .where(
          and(
            eq(rolePermissionTable.roleId, input.roleId),
            eq(rolePermissionTable.permissionId, perm.id)
          )
        );
      return { state: "success", success: "Permission unassigned" };
    }
  });
