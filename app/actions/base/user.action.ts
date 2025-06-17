"use server";

import { InferModel, eq } from "drizzle-orm";
import db from "@/lib/database";
import { userTable } from "@/lib/database/schema";
import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric } from "@/types/auth.type";

// Pełny typ odpowiadający wierszowi w tabeli users
export type User = InferModel<typeof userTable>;

// Typ wstawiania nowego użytkownika (bez id, createdAt, updatedAt)
export type NewUser = Omit<User, "id" | "createdAt" | "updatedAt">;

// Typ aktualizacji (częściowy NewUser + obowiązkowe id)
export type UpdateUser = Partial<NewUser> & { id: string };

export const createUser = async (
  input: NewUser
): Promise<ActionResultGeneric<User>> =>
  wrap(async () => {
    const requiredPermission = "user:create";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // Sprawdź unikalność userName i email
    const existsByName = await db.query.userTable.findFirst({
      where: (u) => eq(u.userName, input.userName),
    });
    if (existsByName) {
      return { state: "error", error: "Username already taken" };
    }
    const existsByEmail = await db.query.userTable.findFirst({
      where: (u) => eq(u.email, input.email),
    });
    if (existsByEmail) {
      return { state: "error", error: "Email already in use" };
    }

    const [newUser] = await db
      .insert(userTable)
      .values(input)
      .returning();

    return { state: "success", success: "User created", data: newUser };
  });

export const getUserById = async (
  id: string
): Promise<ActionResultGeneric<User>> =>
  wrap(async () => {
    const requiredPermission = "user:read";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const user = await db.query.userTable.findFirst({
      where: (u) => eq(u.id, id),
    });
    if (!user) {
      return { state: "error", error: "User not found" };
    }

    return { state: "success", success: "User found", data: user };
  });

export const updateUser = async (
  input: UpdateUser
): Promise<ActionResultGeneric<User>> =>
  wrap(async () => {
    const requiredPermission = "user:update";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const existing = await db.query.userTable.findFirst({
      where: (u) => eq(u.id, input.id),
    });
    if (!existing) {
      return { state: "error", error: "User not found" };
    }

    // Jeżeli chcemy sprawdzić unikalność, najpierw wyciągamy wartości do const:
    const newUserName = input.userName;
    const newEmail = input.email;

    if (
      (newUserName && newUserName !== existing.userName) ||
      (newEmail && newEmail !== existing.email)
    ) {
      if (newUserName && newUserName !== existing.userName) {
        // Narrowing: newUserName tu jest pewnie string
        const nameExists = await db.query.userTable.findFirst({
          where: (u) => eq(u.userName, newUserName),
        });
        if (nameExists) {
          return { state: "error", error: "Username already taken" };
        }
      }
      if (newEmail && newEmail !== existing.email) {
        // Narrowing: newEmail tu jest pewnie string
        const emailExists = await db.query.userTable.findFirst({
          where: (u) => eq(u.email, newEmail),
        });
        if (emailExists) {
          return { state: "error", error: "Email already in use" };
        }
      }
    }

    const { id, ...patch } = input;
    const [updated] = await db
      .update(userTable)
      .set(patch)
      .where(eq(userTable.id, id))
      .returning();

    return { state: "success", success: "User updated", data: updated };
  });


export const deleteUser = async (
  id: string
): Promise<ActionResultGeneric> =>
  wrap(async () => {
    const requiredPermission = "user:delete";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const exists = await db.query.userTable.findFirst({
      where: (u) => eq(u.id, id),
    });
    if (!exists) {
      return { state: "error", error: "User not found" };
    }

    await db.delete(userTable).where(eq(userTable.id, id));
    return { state: "success", success: "User deleted" };
  });

export const listUsers = async (): Promise<ActionResultGeneric<User[]>> =>
  wrap(async () => {
    const requiredPermission = "user:list";
    const { user: authUser } = await authorize();
    if (!authUser) return { state: "error", error: "Authentication required" };
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    const users = await db.select().from(userTable);
    return { state: "success", success: "Users retrieved", data: users };
  });
