"use server";

import { and, eq } from "drizzle-orm";
import db from "@/lib/database";
import { roleJobUserTable, roleJobTable, userTable } from "@/lib/database/schema";
import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric } from "@/types/auth.type";

export type RoleJobUser = {
  userId: string;
  roleJobId: string;
};

export const createRoleJobUser = async (
  input: { userId: string; roleJobId: string }
): Promise<ActionResultGeneric<RoleJobUser>> =>
  wrap(async () => {
    const requiredPermission = "roleJobUser:create";
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
    const roleJobExists = await db.query.roleJobTable.findFirst({
      where: (r) => eq(r.id, input.roleJobId),
    });
    if (!roleJobExists) {
      return { state: "error", error: "RoleJob not found" };
    }

    // Sprawdź, czy relacja już nie istnieje
    const exists = await db.query.roleJobUserTable.findFirst({
      where: (r) =>
        and(eq(r.userId, input.userId), eq(r.roleJobId, input.roleJobId)),
    });
    if (exists) {
      return { state: "error", error: "Relation already exists" };
    }

    const [newRel] = await db
      .insert(roleJobUserTable)
      .values({
        userId: input.userId,
        roleJobId: input.roleJobId,
      })
      .returning();

    return { state: "success", success: "RoleJobUser created", data: newRel };
  });

export const getRoleJobUserById = async (
  userId: string,
  roleJobId: string
): Promise<ActionResultGeneric<RoleJobUser>> =>
  wrap(async () => {
    const requiredPermission = "roleJobUser:read";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rel = await db.query.roleJobUserTable.findFirst({
      where: (r) =>
        and(eq(r.userId, userId), eq(r.roleJobId, roleJobId)),
    });
    if (!rel) {
      return { state: "error", error: "RoleJobUser not found" };
    }

    return { state: "success", success: "RoleJobUser found", data: rel };
  });

export const deleteRoleJobUser = async (
  userId: string,
  roleJobId: string
): Promise<ActionResultGeneric> =>
  wrap(async () => {
    const requiredPermission = "roleJobUser:delete";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const exists = await db.query.roleJobUserTable.findFirst({
      where: (r) =>
        and(eq(r.userId, userId), eq(r.roleJobId, roleJobId)),
    });
    if (!exists) {
      return { state: "error", error: "RoleJobUser not found" };
    }

    await db
      .delete(roleJobUserTable)
      .where(
        and(
          eq(roleJobUserTable.userId, userId),
          eq(roleJobUserTable.roleJobId, roleJobId)
        )
      );

    return { state: "success", success: "RoleJobUser deleted" };
  });

export const listRoleJobUsers = async (): Promise<
  ActionResultGeneric<RoleJobUser[]>
> =>
  wrap(async () => {
    const requiredPermission = "roleJobUser:list";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rels = await db.select().from(roleJobUserTable);
    return { state: "success", success: "RoleJobUsers retrieved", data: rels };
  });
