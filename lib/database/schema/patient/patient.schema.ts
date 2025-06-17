import {
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { userTable, objectTable } from "../core/core.schema";
import { medicationTable } from "../medication/medication.schema";

export const patientGenderEnum = pgEnum("patient_gender", [
  "none",
  "M",
  "F",
]);

export const hospitalizationStatusEnum = pgEnum("hospitalization_status", [
  "none",
  "Aktywny",
  "Zgon",
  "Wypisany",
  "Przepustka",
]);

export const patientTable = pgTable(
	"patient", 
	{
		id: uuid("id").primaryKey().defaultRandom(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		PESEL: text("pesel").notNull().unique(),
		birthDate: timestamp("birth_date").notNull(),
		gender: patientGenderEnum("gender").notNull().default("none"),
	}
);

export const examinationTable = pgTable("examination", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const patientExaminationTable = pgTable(
  "patient_examination",
  {
	id: uuid("id").primaryKey().defaultRandom(),
	patientId: uuid("patient_id").references(() => patientTable.id),
	examinationId: uuid("examination_id").references(() => examinationTable.id),
	result: text("result").notNull(),
	conductedAt: timestamp("conducted_at").defaultNow(),
	conductedBy: uuid("conducted_by").references(() => userTable.id),
  },
  (table) => ({
	examinationConductedAtIdx: index("idx_examination_conducted_at").on(
	  table.conductedAt
	),
  })
);

export const resultTable = pgTable(
  "results",
  {
	id: uuid("id").primaryKey().defaultRandom(),
	patientId: uuid("patient_id").references(() => patientTable.id),
	examinationId: uuid("examination_id").references(() => examinationTable.id),
	dateOfEntry: timestamp("date_of_entry").defaultNow(),
	conductedBy: uuid("conducted_by").references(() => userTable.id),
	type: text("type"),
	description: text("description"),
  },
  (table) => ({
	dateOfEntryPatientExaminationIdx: index("idx_patient_examination_date_of_entry").on(table.dateOfEntry),
  })
);

export const patientMedicationTable = pgTable(
  "patient_medication",
  {
	id: uuid("id").primaryKey().defaultRandom(),
	patientId: uuid("patient_id").references(() => patientTable.id),
	medicationId: integer("medication_id").references(() => medicationTable.id),
	amountOfBoxes: integer("amount_of_boxes"),
	amountOfPills: integer("amount_of_pills"),
	kowalCode: text("kowal_code"),
	dateOfEntry: timestamp("date_of_entry").defaultNow(),
	enteredBy: uuid("entered_by").references(() => userTable.id),
  },
  (table) => ({
	dateOfEntryPatientMedicationIdx: index("idx_patient_medication_date_of_entry").on(
	  table.dateOfEntry
	),
  })
);

export const patientAdmissionTable = pgTable(
  "patient_admission",
  {
	id: uuid("id").primaryKey().defaultRandom(),
	patientId: uuid("patient_id").references(() => patientTable.id),
	stayBegin: timestamp("stay_begin").defaultNow(),
	unitId: uuid("unit_id").references(() => objectTable.id),
	attendingPhysician: uuid("attending_physician").references(() => userTable.id),
	hospitalizationStatus: hospitalizationStatusEnum("hospitalization_status_patient")
	  .notNull()
	  .default("none"),
	stayEnd: timestamp("stay_end"),
	mode: text("mode"),
	admissionBy: uuid("admission_by").references(() => userTable.id),
	referralNumber: text("referral_number"),
	referralSource: text("referral_source"),
	bedId: uuid("bed_id").references(() => objectTable.id),
	roomId: uuid("room_id").references(() => objectTable.id),
	dischargeBy: uuid("discharge_by").references(() => userTable.id),
	modificationDate: timestamp("modification_date").defaultNow(),
  },
  (table) => ({
	admissionModificationDateIdx: index("idx_admission_modification_date").on(
	  table.modificationDate
	),
	admissionStayBeginIdx: index("idx_admission_stay_begin").on(
	  table.stayBegin
	),
	admissionStayEndIdx: index("idx_admission_stay_end").on(
	  table.stayEnd
	),
  })
);