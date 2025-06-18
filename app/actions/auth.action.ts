"use server";

import db from "@/lib/database";
import {
  sessionTable,
  userTable,
} from "@/lib/database/schema/core/core.schema";
import { auth } from "@/lib/lucia";
import { ValidationError, validate } from "@/lib/utils";
import wrap, { authorize } from "@/lib/server-utils";
import {
  signInSchema,
  signUpSchema,
  activationSchema,
} from "@/types/auth/schema";
import {
  type SignInInput,
  type SignUpInput,
  type ActivationInput,
} from "@/types/auth/types";
import type { ActionResult } from "@/types/shared/action-result";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const SESSION_EXPIRY_SEC = 60 * 60 * 24 * 3; // 3 days
const BCRYPT_SALT_ROUNDS = 12;

// ---- Cookie/session helpers ----

async function setSessionCookie(sessionId: string) {
  const { name, value, attributes } = auth.createSessionCookie(sessionId);
  cookies().set(name, value, attributes);
}

async function clearSessionCookie() {
  const { name, value, attributes } = auth.createBlankSessionCookie();
  cookies().set(name, value, attributes);
}

// ---- Actions ----

export const signIn = async (input: SignInInput): Promise<ActionResult> =>
  wrap(async () => {
    const { userName, password } = validate(signInSchema, input);

    const user = await db.query.userTable.findFirst({
      where: (t) => eq(t.userName, userName),
    });
    if (!user?.hashedPassword) return { error: "User not found" };

    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) return { error: "Invalid username or password" };

    const session = await auth.createSession(user.id, {
      expiresIn: SESSION_EXPIRY_SEC,
    });

    await setSessionCookie(session.id);
    return { success: "Signed in successfully" };
  });

export const signUp = async (input: SignUpInput): Promise<ActionResult> =>
  wrap(async () => {
    const { userName, firstName, lastName, email, password } = validate(
      signUpSchema,
      input
    );

    const exists = await db.query.userTable.findFirst({
      where: (t) => eq(t.userName, userName),
    });
    if (exists) return { error: "Username already taken" };

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    await db.insert(userTable).values({
      userName,
      firstName,
      lastName,
      email,
      hashedPassword,
    });

    return { success: "Account created successfully" };
  });

export const accountActivation = async (
  input: ActivationInput
): Promise<ActionResult> =>
  wrap(async () => {
    const { user } = await authorize();
    if (!user) return { error: "Unauthorized" };

    const { password, pin } = validate(activationSchema, input);

    const updateData: Partial<typeof userTable.$inferInsert> = {
      hashedPassword: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS),
      active: true,
    };

    if (pin) {
      updateData.hashedPin = await bcrypt.hash(pin, BCRYPT_SALT_ROUNDS);
    }

    await db
      .update(userTable)
      .set(updateData)
      .where(eq(userTable.id, user.id))
      .execute();

    return { success: "Account activated successfully" };
  });

export const signOut = async (): Promise<ActionResult> =>
  wrap(async () => {
    const { session, user } = await authorize();
    if (!session || !user) return { error: "No active session" };

    await auth.invalidateSession(session.id);
    await clearSessionCookie();

    await db
      .delete(sessionTable)
      .where(eq(sessionTable.userId, user.id))
      .execute();

    return { success: "Signed out successfully" };
  });
