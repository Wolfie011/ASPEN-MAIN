import type { userTable } from "@/lib/database/schema/core/core.schema";
import luciaAdapter from "@/lib/lucia/lucia.adapter";
import type { InferSelectModel } from "drizzle-orm";
import { Lucia, TimeSpan } from "lucia";

type DbUser = InferSelectModel<typeof userTable>;

export const auth = new Lucia(luciaAdapter, {
	sessionExpiresIn: new TimeSpan(3, "d"),
	sessionCookie: {
		expires: true,
		attributes: {
			path: "/",
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		},
	},
	getUserAttributes: (rawUser: unknown) => {
		const user = rawUser as DbUser;
		return {
			id: user.id,
			username: user.userName,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			active: user.active,
		};
	},
});

declare module "lucia" {
	interface Register {
		Lucia: typeof auth;
		DatabaseUserAttributes: {
			id: string;
			userName: string;
			firstName: string;
			lastName: string;
			email: string;
			active: boolean;
		};
	}
}
