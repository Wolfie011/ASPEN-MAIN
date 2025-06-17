import db from "@/lib/database";
import {
	sessionTable,
	userTable,
} from "@/lib/database/schema/core/core.schema";
// lib/lucia/adapter.ts
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

export const adapter = new DrizzlePostgreSQLAdapter(
	db,
	sessionTable,
	userTable,
);
