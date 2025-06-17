import { relations } from "drizzle-orm";
import {
	bedTable,
	permissionTable,
	roleJobTable,
	roleJobUserTable,
	rolePermissionTable,
	roleTable,
	roomTable,
	sessionTable,
	unitTable,
	userRoleTable,
	userTable,
	userUnitTable,
} from "./core.schema";

// Users
export const userRelations = relations(userTable, ({ many }) => ({
	roleJobs: many(roleJobUserTable, { relationName: "userId" }),
	roles: many(userRoleTable, { relationName: "userId" }),
	sessions: many(sessionTable, { relationName: "userId" }),
	units: many(userUnitTable, { relationName: "userId" }),
}));

// RoleJob (positions)
export const roleJobRelations = relations(roleJobTable, ({ many }) => ({
	users: many(roleJobUserTable, { relationName: "roleJobId" }),
}));

// RoleJobUser (join table)
export const roleJobUserRelations = relations(roleJobUserTable, ({ one }) => ({
	user: one(userTable, {
		relationName: "userId",
		fields: [roleJobUserTable.userId],
		references: [userTable.id],
	}),
	roleJob: one(roleJobTable, {
		relationName: "roleJobId",
		fields: [roleJobUserTable.roleJobId],
		references: [roleJobTable.id],
	}),
}));

// Roles and Permissions
export const roleRelations = relations(roleTable, ({ many }) => ({
	permissions: many(rolePermissionTable, { relationName: "roleId" }),
	users: many(userRoleTable, { relationName: "roleId" }),
}));

export const permissionRelations = relations(permissionTable, ({ many }) => ({
	roles: many(rolePermissionTable, { relationName: "permissionId" }),
}));

export const rolePermissionRelations = relations(rolePermissionTable, ({ one }) => ({
	role: one(roleTable, {
		relationName: "roleId",
		fields: [rolePermissionTable.roleId],
		references: [roleTable.id],
	}),
	permission: one(permissionTable, {
		relationName: "permissionId",
		fields: [rolePermissionTable.permissionId],
		references: [permissionTable.id],
	}),
}));

export const userRoleRelations = relations(userRoleTable, ({ one }) => ({
	user: one(userTable, {
		relationName: "userId",
		fields: [userRoleTable.userId],
		references: [userTable.id],
	}),
	role: one(roleTable, {
		relationName: "roleId",
		fields: [userRoleTable.roleId],
		references: [roleTable.id],
	}),
}));

// Units, Rooms, Beds
export const unitRelations = relations(unitTable, ({ one, many }) => ({
	director: one(userTable, {
		relationName: "directorId",
		fields: [unitTable.directorId],
		references: [userTable.id],
	}),
	rooms: many(roomTable, { relationName: "unitId" }),
	userUnits: many(userUnitTable, { relationName: "unitId" }),
}));

export const roomRelations = relations(roomTable, ({ one, many }) => ({
	unit: one(unitTable, {
		relationName: "unitId",
		fields: [roomTable.unitId],
		references: [unitTable.id],
	}),
	beds: many(bedTable, { relationName: "roomId" }),
}));

export const bedRelations = relations(bedTable, ({ one }) => ({
	room: one(roomTable, {
		relationName: "roomId",
		fields: [bedTable.roomId],
		references: [roomTable.id],
	}),
}));


// UserUnit (join table user <-> unit)
export const userUnitRelations = relations(userUnitTable, ({ one }) => ({
	user: one(userTable, {
		relationName: "userId",
		fields: [userUnitTable.userId],
		references: [userTable.id],
	}),
	unit: one(unitTable, {
		relationName: "unitId",
		fields: [userUnitTable.unitId],
		references: [unitTable.id],
	}),
}));

// Session (user session)
export const sessionRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		relationName: "userId",
		fields: [sessionTable.userId],
		references: [userTable.id],
	}),
}));
