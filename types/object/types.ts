import { InferSelectModel } from "drizzle-orm";
import { objectTable } from "@/lib/database/schema/core/core.schema";
import z from "zod";

export type ObjectType = InferSelectModel<typeof objectTable>;