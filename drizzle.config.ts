import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
	out: "./drizzle/app/",
	schema: "./lib/database/schema/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
