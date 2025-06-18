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
import { ActionResult } from "@/types/shared/action-result";
import { ValidationError } from "./utils";

/**
 * Initializes `.env` loading – unnecessary in Next.js 14
 * since it's handled at build time by default.
 * You can remove dotenv unless you're running scripts directly with ts-node.
 */
// import { config } from "dotenv";
// config();

// Toggle permission checks via env var
const isPermissionEnabled = process.env.PERMISSION_ENABLED === "true";

/**
 * Authorize user session using lucia auth and cookies.
 * Note: `cookies()` is still valid in server-only context (Next.js 14+).
 */
export async function authorize() {
  const cookieStore = cookies();
  const sessionCookieValue = cookieStore.get("auth_session")?.value || "";
  return auth.validateSession(sessionCookieValue);
}

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

/**
 * Wrapper to handle known and unknown errors safely.
 */
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
