"use server";

import { eq, and, inArray } from "drizzle-orm";
import db from "@/lib/database";
import {
  userTable,
  roleJobUserTable,
  roleJobTable,
  userRoleTable,
  rolePermissionTable,
  permissionTable,
  userUnitTable,
  objectTable,
  roleTable,
} from "@/lib/database/schema";
import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric, SignUpInput, signUpSchema } from "@/types/auth.type";
import { validate } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { UpdateUserInput, updateUserSchema } from "@/types/user.type";

const BCRYPT_SALT_ROUNDS = 12;

export type User = {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  active: boolean;
  roleJob: { id: string; tag: string }[];
  permissionRole: { id: string; tag: string }[];
  units: { id: string; tag: string }[];
};

export const createUser = async (
  input: SignUpInput
): Promise<ActionResultGeneric<User>> =>
  wrap(async () => {
    const requiredPermission = "user:create";
    const { user: authUser } = await authorize();
    if (!authUser) {
      return { state: "error", error: "Authentication required" };
    }
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // Walidacja inputu na podstawie zoda
    const { userName, firstName, lastName, email, password } = validate(
      signUpSchema,
      input
    );

    // Sprawdź, czy login jest wolny
    const exists = await db.query.userTable.findFirst({
      where: (t) => eq(t.userName, userName),
    });
    if (exists) {
      return { state: "error", error: "Username already taken" };
    }

    // Zhashuj hasło
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Wstaw rekord do tabeli users
    const [inserted] = await db
      .insert(userTable)
      .values({
        userName,
        firstName,
        lastName,
        email,
        hashedPassword,
      })
      .returning({ id: userTable.id });

    if (!inserted || !inserted.id) {
      return { state: "error", error: "Failed to create user" };
    }

    // Pobierz pełne dane nowo utworzonego użytkownika (z relacjami)
    const newUserResult = await getUserById(inserted.id);
    if (newUserResult.state !== "success" || !newUserResult.data) {
      return { state: "error", error: "Failed to fetch created user data" };
    }

    return {
      state: "success",
      success: "Account created successfully",
      data: newUserResult.data,
    };
  });

export const getUserById = async (
  id: string
): Promise<ActionResultGeneric<User>> =>
  wrap(async () => {
    const requiredPermission = "user:read";
    const { user: authUser } = await authorize();
    if (!authUser) {
      return { state: "error", error: "Authentication required" };
    }
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    return await db.transaction(async (tx) => {
      // 1) Pobierz podstawowe dane użytkownika
      const userRow = await tx.query.userTable.findFirst({
        where: (u) => eq(u.id, id),
      });
      if (!userRow) {
        return { state: "error", error: "User not found" };
      }

      // 2) Pobierz roleJob
      const roleJobRows = await tx
        .select({
          userId: roleJobUserTable.userId,
          id: roleJobTable.id,
          tag: roleJobTable.name,
        })
        .from(roleJobUserTable)
        .innerJoin(
          roleJobTable,
          eq(roleJobUserTable.roleJobId, roleJobTable.id)
        )
        .where(eq(roleJobUserTable.userId, id));

      // 3) Pobierz permissionRole
      const roleRows = await tx
        .select({
          userId: userRoleTable.userId,
          id: roleTable.id,
          tag: roleTable.name,
        })
        .from(userRoleTable)
        .innerJoin(
          roleTable,
          eq(userRoleTable.roleId, roleTable.id)
        )
        .where(eq(userRoleTable.userId, id));

      // 4) Pobierz units
      const unitRows = await tx
        .select({
          userId: userUnitTable.userId,
          id: objectTable.id,
          tag: objectTable.name,
        })
        .from(userUnitTable)
        .innerJoin(objectTable, eq(userUnitTable.unitId, objectTable.id))
        .where(eq(userUnitTable.userId, id));

      // 5) Zbuduj obiekt User
      const result: User = {
        id: userRow.id,
        userName: userRow.userName,
        firstName: userRow.firstName,
        lastName: userRow.lastName,
        email: userRow.email,
        phone: userRow.phone,
        active: userRow.active,
        roleJob: roleJobRows.map((r) => ({ id: r.id, tag: r.tag })),
        permissionRole: roleRows.map((p) => ({
          id: p.id,
          tag: p.tag,
        })),
        units: unitRows.map((u) => ({ id: u.id, tag: u.tag })),
      };

      return { state: "success", success: "User found", data: result };
    });
  });

export const listUsers = async (): Promise<ActionResultGeneric<User[]>> =>
  wrap(async () => {
    const requiredPermission = "user:list";
    const { user: authUser } = await authorize();
    if (!authUser) {
      return { state: "error", error: "Authentication required" };
    }
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    return await db.transaction(async (tx) => {
      // 1) Pobierz wszystkich użytkowników
      const users = await tx.query.userTable.findMany();
      const userIds = users.map((u) => u.id);
      if (userIds.length === 0) {
        return { state: "success", success: "No users found", data: [] };
      }

      // 2) Pobierz wszystkie roleJob dla userIds
      const roleJobRows = await tx
        .select({
          userId: roleJobUserTable.userId,
          id: roleJobTable.id,
          tag: roleJobTable.name,
        })
        .from(roleJobUserTable)
        .innerJoin(
          roleJobTable,
          eq(roleJobUserTable.roleJobId, roleJobTable.id)
        )
        .where(inArray(roleJobUserTable.userId, userIds));

      // 3) Pobierz wszystkie uprawnienia (roleRole) dla userIds
      const roleRows = await tx
        .select({
          userId: userRoleTable.userId,
          id: roleTable.id,
          tag: roleTable.name,
        })
        .from(userRoleTable)
        .innerJoin(
          roleTable,
          eq(userRoleTable.roleId, roleTable.id)
        )
        .where(inArray(userRoleTable.userId, userIds));

      // 4) Pobierz wszystkie units
      const unitRows = await tx
        .select({
          userId: userUnitTable.userId,
          id: objectTable.id,
          tag: objectTable.name,
        })
        .from(userUnitTable)
        .innerJoin(objectTable, eq(userUnitTable.unitId, objectTable.id))
        .where(inArray(userUnitTable.userId, userIds));

      // 5) Przygotuj mapy relacji
      const roleJobMap = new Map<string, { id: string; tag: string }[]>();
      const roleMap = new Map<string, { id: string; tag: string }[]>();
      const unitMap = new Map<string, { id: string; tag: string }[]>();

      for (const uid of userIds) {
        roleJobMap.set(uid, []);
        roleMap.set(uid, []);
        unitMap.set(uid, []);
      }

      for (const row of roleJobRows) {
        roleJobMap.get(row.userId)!.push({ id: row.id, tag: row.tag });
      }
      for (const row of roleRows) {
        roleMap
          .get(row.userId)!
          .push({ id: row.id, tag: row.tag });
      }
      for (const row of unitRows) {
        unitMap.get(row.userId)!.push({ id: row.id, tag: row.tag });
      }

      // 6) Złóż finalną tablicę User[]
      const result: User[] = users.map((u) => ({
        id: u.id,
        userName: u.userName,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        active: u.active,
        roleJob: roleJobMap.get(u.id)!,
        permissionRole: roleMap.get(u.id)!,
        units: unitMap.get(u.id)!,
      }));

      return {
        state: "success",
        success: "Users retrieved",
        data: result,
      };
    });
  });

export const updateUser = async (
  input: UpdateUserInput
): Promise<ActionResultGeneric<User>> =>
  wrap(async () => {
    const requiredPermission = "user:update";
    const { user: authUser } = await authorize();
    if (!authUser) {
      return { state: "error", error: "Authentication required" };
    }
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    // Walidacja danych wejściowych
    const {
      id,
      userName,
      firstName,
      lastName,
      email,
      phone,
      roleJob,
      permissionRole,
    } = validate(updateUserSchema, input);

    // Sprawdź, czy użytkownik istnieje
    const exists = await db.query.userTable.findFirst({
      where: (t) => eq(t.id, id),
    });
    if (!exists) {
      return { state: "error", error: "User with given id does not exist" };
    }

    // Wykonaj wszystkie operacje w jednej transakcji
    await db.transaction(async (tx) => {
      // 1. Aktualizacja głównych pól użytkownika
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (userName !== undefined) updateData.userName = userName;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;

      if (Object.keys(updateData).length > 1) {
        // (pierwszy klucz to always updatedAt, więc >1 oznacza dodatkowe pole)
        await tx
          .update(userTable)
          .set(updateData)
          .where(eq(userTable.id, id));
      }

      // 2. Zaktualizuj roleJobUserTable
      if (roleJob !== undefined) {
        await tx
          .delete(roleJobUserTable)
          .where(eq(roleJobUserTable.userId, id));
        if (roleJob.length > 0) {
          const newRoleJobs = roleJob.map((opt) => ({
            userId: id,
            roleJobId: opt.value,
          }));
          await tx.insert(roleJobUserTable).values(newRoleJobs);
        }
      }

      // 3. Zaktualizuj userRoleTable (permissionRole)
      if (permissionRole !== undefined) {
        await tx
          .delete(userRoleTable)
          .where(eq(userRoleTable.userId, id));
        if (permissionRole.length > 0) {
          const newUserRoles = permissionRole.map((opt) => ({
            userId: id,
            roleId: opt.value,
          }));
          await tx.insert(userRoleTable).values(newUserRoles);
        }
      }
    });

    // 4. Pobierz zaktualizowanego użytkownika z relacjami
    const updatedUserResult = await getUserById(id);
    if (updatedUserResult.state !== "success" || !updatedUserResult.data) {
      return {
        state: "error",
        error: "Failed to fetch updated user data",
      };
    }

    return {
      state: "success",
      success: "Account updated successfully",
      data: updatedUserResult.data,
    };
  });