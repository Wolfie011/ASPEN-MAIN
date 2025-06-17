import { auth } from "@/lib/lucia";
import { cookies } from "next/headers";
import db from "@/lib/database/index";
import { eq, and } from "drizzle-orm";
import {
  roleTable,
  permissionTable,
  rolePermissionTable,
  userRoleTable,
} from "@/lib/database/schema/core/core.schema";
import { config } from "dotenv";
import { ActionResult } from "@/types/auth.type";
import { ValidationError } from "./utils";

export async function authorize() {
	const cookieStore = await cookies();
	const sessionCookieValue = cookieStore.get("auth_session")?.value || "";
	return auth.validateSession(sessionCookieValue);
}

config();

// Toggle permission checks via env var
const isPermissionEnabled = process.env.PERMISSION_ENABLED === "true";

/**
 * Checks if a user has a specific permission.
 * @param userId - user ID string
 * @param requiredPermission - permission string
 * @returns boolean indicating if permission is granted
 */
export async function hasPermission(
  userId: string,
  requiredPermission: string
): Promise<boolean> {
  if (!isPermissionEnabled) {
    return true;
  }

  const result = await db
    .select({ permissionName: permissionTable.name })
    .from(userRoleTable)
    .innerJoin(roleTable, eq(roleTable.id, userRoleTable.roleId))
    .innerJoin(rolePermissionTable, eq(rolePermissionTable.roleId, roleTable.id))
    .innerJoin(permissionTable, eq(permissionTable.id, rolePermissionTable.permissionId))
    .where(and(eq(userRoleTable.userId, userId), eq(permissionTable.name, requiredPermission)))
    .limit(1);

  return result.length > 0;
}

export default async function wrap(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await fn();
  } catch (e: unknown) {
    console.error(e);
    return {
      error: e instanceof ValidationError ? e.message : "Unexpected error",
    };
  }
}