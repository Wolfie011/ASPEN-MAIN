// lib/database/index.ts
import dotenv from "dotenv";
dotenv.config();

import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/* eslint-disable no-var */
declare global {
	var _appPool: Pool | undefined;
	var _appDb: NodePgDatabase<typeof schema> | undefined;
}

const connectionString = process.env.DATABASE_URL!;
let appPool: Pool;
let appDb: NodePgDatabase<typeof schema>;

if (process.env.NODE_ENV === "development") {
	if (!global._appPool) {
		global._appPool = new Pool({ connectionString });
		global._appDb = drizzle(global._appPool, { schema });
	}
	appPool = global._appPool;
	appDb = global._appDb!;
} else {
	appPool = new Pool({ connectionString });
	appDb = drizzle(appPool, { schema });
}

// verify connection once on startup
(async () => {
	try {
		await appDb.execute(`SELECT 1`);
		if (process.env.NODE_ENV !== "production") {
			console.log("🗄️  Database connection OK");
		}
	} catch (error) {
		console.error("❌ Database connection failed:", error);
		process.exit(1);
	}
})();

export default appDb as NodePgDatabase<typeof schema>;
