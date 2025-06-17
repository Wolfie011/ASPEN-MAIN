import {
	boolean,
	doublePrecision,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { userTable } from "../core/core.schema";
import { patientTable } from "../patient/patient.schema";
import { medicationTable } from "../medication/medication.schema";

export const orderStatusEnum = pgEnum("order_status", [
  "none",
  "ORDERED",
  "DONE",
  "CANCELED",
]);

export const administeringStatusEnum = pgEnum("administering_status", [
  "Scheduled",
  "Delivered",
  "Not Delivered",
  "Cancelled",
]);

export const orderModeEnum = pgEnum("order_mode", [
  "ON_DEMAND",     // zlecenia doraźne – reagujemy tylko na front
  "URGENT",        // „na TERAZ” – natychmiastowa dawka, jednorazowa
  "ONE_TIME",      // jednorazowe terminowe („podaj dzisiaj o X”)
  "RECURRING",     // cykliczne wg order_interval
]);

export const orderTable = pgTable(
  "order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id").references(() => patientTable.id),
    orderedBy: uuid("ordered_by").references(() => userTable.id, {
      onDelete: "set null",
    }),
    medicationId: integer("medication_id").references(() => medicationTable.id),
    dose: doublePrecision("dose").notNull(),
    orderBegin: timestamp("order_begin").defaultNow(),
    orderEnd: timestamp("order_end"),
	  orderInterval: text("order_interval"),
    description: text("description"),
    flowRate: text("flow_rate"),
    administerAt: timestamp("administer_at"),
    orderedAt: timestamp("ordered_at").defaultNow(),
    orderStatus: orderStatusEnum("order_status").notNull().default("none"),
    modifiedAt: timestamp("modified_at"),
    canceledAt: timestamp("canceled_at"),
    orderMode : orderModeEnum("order_mode").notNull().default("ON_DEMAND"),
    patientMedication: boolean("patient_medication"),
  },
  (table) => ({
    orderBeginIdx: index("idx_order_begin").on(table.orderBegin),
    orderEndIdx: index("idx_order_end").on(table.orderEnd),
    orderAdministerAtIdx: index("idx_order_administer_at").on(table.administerAt),
    orderCreatedAtIdx: index("idx_order_created_at").on(table.orderedAt),
    orderModifiedAtIdx: index("idx_order_modified_at").on(table.modifiedAt),
    orderCanceledAtIdx: index("idx_order_canceled_at").on(table.canceledAt),
  })
);

export const administeringItemTable = pgTable(
  "administering_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orderTable.id, { onDelete: "cascade" }),

    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),

    status: administeringStatusEnum("status").notNull().default("Scheduled"),

    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    updatedBy: uuid("updated_by").references(() => userTable.id, {
      onDelete: "set null",
    }),

    reason: text("reason"),
  },
  (table) => ({
    uniquePerOrder: index("idx_unique_order_scheduled").on(
      table.orderId,
      table.scheduledAt
    ),
    scheduledAtIdx: index("idx_administering_scheduled").on(table.scheduledAt),
  })
);

export const administeringLogTable = pgTable(
  "administering_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orderTable.id, { onDelete: "cascade" }),

    itemId: uuid("item_id")
      .notNull()
      .references(() => administeringItemTable.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),

    info: text("info").notNull(),
	loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow(),
  }
);