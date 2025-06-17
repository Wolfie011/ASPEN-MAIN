"use server";

import { and, eq } from "drizzle-orm";
import db from "@/lib/database";
import { userRoleTable, userTable, roleTable } from "@/lib/database/schema";
import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric } from "@/types/auth.type";

export type UserRole = {
  userId: string;
  roleId: string;
};

export const createUserRole = async (
  input: { userId: string; roleId: string }
): Promise<ActionResultGeneric<UserRole>> =>
  wrap(async () => {
    const requiredPermission = "userRole:create";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // Sprawdź, czy użytkownik istnieje
    const userExists = await db.query.userTable.findFirst({
      where: (u) => eq(u.id, input.userId),
    });
    if (!userExists) {
      return { state: "error", error: "User not found" };
    }

    // Sprawdź, czy rola istnieje
    const roleExists = await db.query.roleTable.findFirst({
      where: (r) => eq(r.id, input.roleId),
    });
    if (!roleExists) {
      return { state: "error", error: "Role not found" };
    }

    // Sprawdź, czy relacja już nie istnieje
    const exists = await db.query.userRoleTable.findFirst({
      where: (ur) =>
        and(eq(ur.userId, input.userId), eq(ur.roleId, input.roleId)),
    });
    if (exists) {
      return { state: "error", error: "Relation already exists" };
    }

    const [newRel] = await db
      .insert(userRoleTable)
      .values({
        userId: input.userId,
        roleId: input.roleId,
      })
      .returning();

    return { state: "success", success: "UserRole created", data: newRel };
  });

export const getUserRoleById = async (
  userId: string,
  roleId: string
): Promise<ActionResultGeneric<UserRole>> =>
  wrap(async () => {
    const requiredPermission = "userRole:read";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rel = await db.query.userRoleTable.findFirst({
      where: (ur) =>
        and(eq(ur.userId, userId), eq(ur.roleId, roleId)),
    });
    if (!rel) {
      return { state: "error", error: "UserRole not found" };
    }

    return { state: "success", success: "UserRole found", data: rel };
  });

export const deleteUserRole = async (
  userId: string,
  roleId: string
): Promise<ActionResultGeneric> =>
  wrap(async () => {
    const requiredPermission = "userRole:delete";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const exists = await db.query.userRoleTable.findFirst({
      where: (ur) =>
        and(eq(ur.userId, userId), eq(ur.roleId, roleId)),
    });
    if (!exists) {
      return { state: "error", error: "UserRole not found" };
    }

    await db
      .delete(userRoleTable)
      .where(
        and(
          eq(userRoleTable.userId, userId),
          eq(userRoleTable.roleId, roleId)
        )
      );

    return { state: "success", success: "UserRole deleted" };
  });

export const listUserRoles = async (): Promise<
  ActionResultGeneric<UserRole[]>
> =>
  wrap(async () => {
    const requiredPermission = "userRole:list";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rels = await db.select().from(userRoleTable);
    return { state: "success", success: "UserRoles retrieved", data: rels };
  });
