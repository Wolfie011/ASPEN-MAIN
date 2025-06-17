"use server";

import { and, eq } from "drizzle-orm";
import db from "@/lib/database";
import { userUnitTable, unitTable, userTable } from "@/lib/database/schema";
import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric } from "@/types/auth.type";

export type UserUnit = {
  userId: string;
  unitId: string;
};

export const createUserUnit = async (
  input: { userId: string; unitId: string }
): Promise<ActionResultGeneric<UserUnit>> =>
  wrap(async () => {
    const requiredPermission = "userUnit:create";
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

    // Sprawdź, czy jednostka istnieje
    const unitExists = await db.query.unitTable.findFirst({
      where: (u) => eq(u.id, input.unitId),
    });
    if (!unitExists) {
      return { state: "error", error: "Unit not found" };
    }

    // Sprawdź, czy relacja już nie istnieje
    const exists = await db.query.userUnitTable.findFirst({
      where: (r) =>
        and(eq(r.userId, input.userId), eq(r.unitId, input.unitId)),
    });
    if (exists) {
      return { state: "error", error: "Relation already exists" };
    }

    const [newUserUnit] = await db
      .insert(userUnitTable)
      .values({
        userId: input.userId,
        unitId: input.unitId,
      })
      .returning();

    return { state: "success", success: "UserUnit created", data: newUserUnit };
  });

export const getUserUnitById = async (
  userId: string,
  unitId: string
): Promise<ActionResultGeneric<UserUnit>> =>
  wrap(async () => {
    const requiredPermission = "userUnit:read";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rel = await db.query.userUnitTable.findFirst({
      where: (r) =>
        and(eq(r.userId, userId), eq(r.unitId, unitId)),
    });
    if (!rel) {
      return { state: "error", error: "UserUnit not found" };
    }

    return { state: "success", success: "UserUnit found", data: rel };
  });

export const deleteUserUnit = async (
  userId: string,
  unitId: string
): Promise<ActionResultGeneric> =>
  wrap(async () => {
    const requiredPermission = "userUnit:delete";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const exists = await db.query.userUnitTable.findFirst({
      where: (r) =>
        and(eq(r.userId, userId), eq(r.unitId, unitId)),
    });
    if (!exists) {
      return { state: "error", error: "UserUnit not found" };
    }

    await db
      .delete(userUnitTable)
      .where(
        and(eq(userUnitTable.userId, userId), eq(userUnitTable.unitId, unitId))
      );

    return { state: "success", success: "UserUnit deleted" };
  });

export const listUserUnits = async (): Promise<ActionResultGeneric<UserUnit[]>> =>
  wrap(async () => {
    const requiredPermission = "userUnit:list";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const rels = await db.select().from(userUnitTable);
    return { state: "success", success: "UserUnits retrieved", data: rels };
  });
