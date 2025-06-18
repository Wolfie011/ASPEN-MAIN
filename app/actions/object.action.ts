"use server";

import { eq } from "drizzle-orm";
import db from "@/lib/database";
import wrap, { authorize, hasPermission } from "@/lib/server-utils";
import { objectTable } from "@/lib/database/schema/core/core.schema";
import { ActionResultGeneric } from "@/types/shared/action-result";
import { CreateObjectInput } from "@/types/object/schema";
import { ObjectType } from "@/types/object/types";

// Lista organizacji
export const listObjects = async (
  page?: number,
  size?: number
): Promise<ActionResultGeneric<{ data: ObjectType[]; total: number }>> =>
  wrap(async () => {
    const { user } = await authorize();
    if (!user) return { state: "error", error: "Authentication required" };

    const canList = await hasPermission(user.id, "organization:list");
    if (!canList) return { state: "error", error: "Insufficient permissions" };

    const total = await db.select().from(objectTable).then((rows) => rows.length);

    const data = await db
      .select()
      .from(objectTable)
      .orderBy(objectTable.level)
      .limit(size || total)
      .offset(page && size ? (page - 1) * size : 0);

    return { state: "success", data: { data, total }, success: "OK" };
  });

export const listAllObjects = async (): Promise<ActionResultGeneric<ObjectType[]>> =>
  wrap(async () => {
    const { user } = await authorize();
    if (!user) return { state: "error", error: "Authentication required" };

    const canList = await hasPermission(user.id, "organization:list");
    if (!canList) return { state: "error", error: "Insufficient permissions" };

    const all = await db.select().from(objectTable);
    return { state: "success", data: all, success: "Fetched all" };
  });

// Pobierz pojedynczą organizację
export const getObject = async (
  id: string
): Promise<ActionResultGeneric<ObjectType>> =>
  wrap(async () => {
    const { user } = await authorize();
    if (!user) return { state: "error", error: "Authentication required" };

    const canRead = await hasPermission(user.id, "organization:read");
    if (!canRead) return { state: "error", error: "Insufficient permissions" };

    const record = await db.query.objectTable.findFirst({
      where: eq(objectTable.id, id),
    });

    if (!record) return { state: "error", error: "Organization not found" };

    return { state: "success", success: "Organization retrieved", data: record };
  });

// Dodaj organizację
export const createObject = async (
  input: CreateObjectInput
): Promise<ActionResultGeneric<ObjectType>> =>
  wrap(async () => {
    const { user } = await authorize();
    if (!user) return { state: "error", error: "Authentication required" };

    const canCreate = await hasPermission(user.id, "organization:create");
    if (!canCreate) return { state: "error", error: "Insufficient permissions" };

    const [created] = await db.insert(objectTable).values(input).returning();
    return { state: "success", success: "Organization created", data: created };
  });

// Aktualizuj organizację
export const updateObject = async (
  id: string,
  input: Partial<ObjectType>
): Promise<ActionResultGeneric<ObjectType>> =>
  wrap(async () => {
    const { user } = await authorize();
    if (!user) return { state: "error", error: "Authentication required" };

    const canUpdate = await hasPermission(user.id, "organization:update");
    if (!canUpdate) return { state: "error", error: "Insufficient permissions" };

    const [updated] = await db
      .update(objectTable)
      .set(input)
      .where(eq(objectTable.id, id))
      .returning();

    return { state: "success", success: "Organization updated", data: updated };
  });

// Usuń organizację
export const deleteObject = async (
  id: string
): Promise<ActionResultGeneric<null>> =>
  wrap(async () => {
    const { user } = await authorize();
    if (!user) return { state: "error", error: "Authentication required" };

    const canDelete = await hasPermission(user.id, "organization:delete");
    if (!canDelete) return { state: "error", error: "Insufficient permissions" };

    await db.delete(objectTable).where(eq(objectTable.id, id));
    return { state: "success", success: "Organization deleted", data: null };
  });
