import {
	AnyPgColumn,
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const userTable = pgTable(
	"users",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userName: text("username").notNull().unique(),
		hashedPassword: text("hashed_password").notNull(),
		email: text("email").notNull().unique(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		phone: text("phone"),
		active: boolean("active").notNull().default(false),
		hashedPin: text("hashed_pin"),
		rfidCard: text("rfid_card"),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdateFn(() => new Date()),
	},
	(table) => ({
		idxCreatedAt: index("idx_users_created_at").on(table.createdAt),
		idxUpdatedAt: index("idx_users_updated_at").on(table.updatedAt),
	}),
);

export const roleJobTable = pgTable("role_job", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
});

export const roleJobUserTable = pgTable(
	"role_job_user",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		roleJobId: uuid("role_job_id")
			.notNull()
			.references(() => roleJobTable.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.roleJobId] }),
		idxUserId: index("idx_role_job_user_user_id").on(table.userId),
		idxRoleJobId: index("idx_role_job_user_role_job_id").on(table.roleJobId),
	}),
);

export const userUnitTable = pgTable(
	"user_unit",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		unitId: uuid("unit_id")
			.notNull()
			.references(() => objectTable.id, { onDelete: "cascade" }),
	},
	(table) => ({
		idxUserId: index("idx_user_unit_user_id").on(table.userId),
		idxUnitId: index("idx_user_unit_unit_id").on(table.unitId),
	}),
);

export const objectTypeEnum = pgEnum("object_type", [
  "Organization",
  "Unit",
  "Room",
  "Bed",
]);

export const objectTable = pgTable(
  "object",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    type: objectTypeEnum("type").notNull(),
    level: integer("level").notNull(),        // 0 = organization, 1 = unit, 2 = room, 3 = bed
	parentId: uuid("parent_id")
	  .references(():AnyPgColumn => objectTable.id , { onDelete: "cascade" }),
  },
  (table) => ({
    idxParent: index("idx_object_parent").on(table.parentId),
    idxTypeLevel: index("idx_object_type_level").on(table.type, table.level),
  })
);

export const roleTable = pgTable("role", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
	description: text("description"),
});

export const permissionTable = pgTable("permission", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
	description: text("description"),
});

export const rolePermissionTable = pgTable(
	"role_permission",
	{
		roleId: uuid("role_id")
			.notNull()
			.references(() => roleTable.id, { onDelete: "cascade" }),
		permissionId: uuid("permission_id")
			.notNull()
			.references(() => permissionTable.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
		idxRoleId: index("idx_role_permission_role_id").on(table.roleId),
		idxPermissionId: index("idx_role_permission_permission_id").on(
			table.permissionId,
		),
	}),
);

export const userRoleTable = pgTable(
	"user_role",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		roleId: uuid("role_id")
			.notNull()
			.references(() => roleTable.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.roleId] }),
		idxUserId: index("idx_user_role_user_id").on(table.userId),
		idxRoleId: index("idx_user_role_role_id").on(table.roleId),
	}),
);

export const sessionTable = pgTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		expiresAt: timestamp("expires_at", {
			withTimezone: true,
			mode: "date",
		}).notNull(),
	},
	(table) => ({
		idxExpiresAt: index("idx_sessions_expires_at").on(table.expiresAt),
	}),
);
