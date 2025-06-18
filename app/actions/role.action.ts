"use server";

import { and, eq } from "drizzle-orm";
import db from "@/lib/database/index";
import {
  permissionTable,
  rolePermissionTable,
  roleTable,
} from "@/lib/database/schema/core/core.schema";
import wrap, { authorize, hasPermission } from "@/lib/server-utils";
import { ActionResultGeneric } from "@/types/shared/action-result";
import {
  Permission,
  Role,
  RolePermission,
} from "@/types/permission/types";

// Pobierz wszystkie role
export const listRoles = async (): Promise<ActionResultGeneric<Role[]>> =>
  wrap(async () => {
    const requiredPermission = "role:read:all";
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

    if (!rows.length) {
      return {
        state: "error",
        error: "Brak przypisanych ról. Skontaktuj się z administratorem.",
      };
    }

    return { state: "success", success: "Roles retrieved", data: rows };
  });

// Pobierz wszystkie uprawnienia
export const getPermissions = async (): Promise<
  ActionResultGeneric<Permission[]>
> =>
  wrap(async () => {
    const requiredPermission = "permission:read:all";
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

    if (!rows.length) {
      return {
        state: "error",
        error: "Brak przypisanych uprawnień. Skontaktuj się z administratorem.",
      };
    }

    return { state: "success", success: "Permissions retrieved", data: rows };
  });

// Pobierz role z przypisanymi uprawnieniami
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

    const [roles, permissions, mappings] = await Promise.all([
      db.select().from(roleTable),
      db.select().from(permissionTable),
      db.select().from(rolePermissionTable),
    ]);

    const data: RolePermission[] = roles.map((role) => ({
      id: role.id,
      roleName: role.name,
      permission: mappings
        .filter((m) => m.roleId === role.id)
        .map((m) => {
          const perm = permissions.find((p) => p.id === m.permissionId)!;
          return { id: perm.id, tag: perm.name };
        }),
    }));

    return {
      state: "success",
      success: "Role-Permission mapping retrieved",
      data,
    };
  });

// Utwórz rolę
export const createRole = async (data: {
  name: string;
  description?: string;
}): Promise<ActionResultGeneric<Role>> =>
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
        name: data.name,
        description: data.description ?? null,
      })
      .returning();

    if (!newRole) {
      return { state: "error", error: "Błąd podczas tworzenia roli." };
    }

    return {
      state: "success",
      success: "Role created",
      data: { id: newRole.id, tag: newRole.name },
    };
  });

// Aktualizuj przypisanie uprawnienia do roli
export const updateRolePermission = async (data: {
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

    if (data.assigned) {
      await db
        .insert(rolePermissionTable)
        .values({
          roleId: data.roleId,
          permissionId: data.permissionId,
        })
        .onConflictDoNothing();
    } else {
      await db
        .delete(rolePermissionTable)
        .where(
          and(
            eq(rolePermissionTable.roleId, data.roleId),
            eq(rolePermissionTable.permissionId, data.permissionId)
          )
        );
    }

    return { state: "success", success: "Uprawnienie zaktualizowane." };
  });
