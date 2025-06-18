import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import db from "@/lib/database/index"
import { sessionTable, userTable } from "@/lib/database/schema"

const luciaAdapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable)

export default luciaAdapter
