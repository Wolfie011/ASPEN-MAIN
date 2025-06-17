import {
	AnyPgColumn,
	boolean,
	date,
	doublePrecision,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { invoiceItemTable, firmTable } from "../invoice/invoice.schema";
import { userTable, objectTable } from "../core/core.schema";

export const equipmentIssueStatusEnum = pgEnum("equipment_issue_status", [
  "none",
  "Zgłoszona",
  "W naprawie",
  "Rozwiązana",
]);

export const equipmentIssueTypeEnum = pgEnum("equipment_issue_type", [
  "none",
  "Urządzenie",
  "Informatyczny",
  "Budynek",
]);

export const dictionaryUnitTypeTable = pgTable("dictionary_unit_type", {
  code: varchar("code", { length: 20 }).primaryKey(),
  description: varchar("description", { length: 100 }).notNull(),
  position: integer("position"),
  active: boolean("active").default(true),
});

export const dictionaryMTypeDocTable = pgTable("dictionary_m_typedoc", {
  code: varchar("code", { length: 20 }).primaryKey(),
  description: varchar("description", { length: 100 }).notNull(),
  position: integer("position"),
  active: boolean("active").default(true),
  autonum: boolean("autonum").default(false),
});

export const dictionaryMSnPowodTable = pgTable("dictionary_m_sn_powod", {
  code: varchar("code", { length: 20 }).primaryKey(),
  description: varchar("description", { length: 100 }).notNull(),
  position: integer("position"),
  active: boolean("active").default(true),
});

export const dictionaryMTypdodTable = pgTable("dictionary_m_typdod", {
  code: varchar("code", { length: 20 }).primaryKey(),
  description: varchar("description", { length: 100 }).notNull(),
  position: integer("position"),
  active: boolean("active").default(true),
});

export const medicationIndexTable = pgTable("medication_index", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  id_produktu: text("id_produktu").unique().notNull(),
  nazwa_produktu: text("nazwa_produktu").notNull(),
  rodzaj_preparatu: text("rodzaj_preparatu"),
  nazwa_powszechnie_stosowana: text("nazwa_powszechnie_stosowana"),
  nazwa_poprzednia_produktu: text("nazwa_poprzednia_produktu"),
  moc: text("moc"),
  nazwa_postaci_farmaceutycznej: text("nazwa_postaci_farmaceutycznej"),
  podmiot_odpowiedzialny: text("podmiot_odpowiedzialny"),
  typ_procedury: text("typ_procedury"),
  numer_pozwolenia: text("numer_pozwolenia"),
  waznosc_pozwolenia: text("waznosc_pozwolenia"),
  podstawa_prawna: text("podstawa_prawna"),
  zakaz_stosowania_u_zwierzat: text("zakaz_stosowania_u_zwierzat"),
  ulotka: text("ulotka"),
  charakterystyka: text("charakterystyka"),
  kod_atc: text("kod_atc"),
  droga_podania: text("droga_podania"),
  substancja_czynna_nazwa: text("substancja_czynna_nazwa"),
  substancja_czynna_ilosc: text("substancja_czynna_ilosc"),
  substancja_czynna_jednostka: text("substancja_czynna_jednostka"),
  substancja_czynna_ilosc_preparatu: text("substancja_czynna_ilosc_preparatu"),
  substancja_czynna_jednostka_preparatu: text("substancja_czynna_jednostka_preparatu"),
  wytworca_nazwa: text("wytworca_nazwa"),
  wytworca_kraj: text("wytworca_kraj"),
  data_aktualizacji: timestamp("data_aktualizacji").defaultNow(),
  moc_opisana: text("moc_opisana"),
  substancja_czynna: text("substancja_czynna"),
}, (table) => ({
  substancjaIdx: index("idx_medication_index_substancja").on(table.substancja_czynna_nazwa),
  idProduktuIdx: index("idx_medication_index_id_produktu").on(table.id_produktu),
}));

export const medicationTable = pgTable("medication", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  product_id: text("product_id").references(() => medicationIndexTable.id_produktu, { onDelete: "cascade" }),
  kod_gtin: text("kod_gtin"),
  kategoria: text("kategoria"),
  skasowane: boolean("skasowane").default(false),
  ilosc: text("ilosc"),
  typ_opakowania: text("typ_opakowania"),
  jednostka: text("jednostka"),
  data_aktualizacji: timestamp("data_aktualizacji").defaultNow(),
  cena: doublePrecision('cena'),
}, (table) => ({
  productIdx: index("idx_medication_product_id").on(table.product_id),
  gtinIdx: uniqueIndex("idx_medication_gtin").on(table.kod_gtin),
}));

export const drugSubstitutesTable = pgTable("drug_substitutes", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  lek_id: text("lek_id").notNull().references(() => medicationIndexTable.id_produktu, { onDelete: "cascade" }),
  lek: text("lek").notNull(),
  substancja_czynna: text("substancja_czynna"),
  moc: text("moc"),
  postac_farmaceutyczna: text("postac_farmaceutyczna"),
  zamiennik_id: text("zamiennik_id").notNull().references(() => medicationIndexTable.id_produktu, { onDelete: "cascade" }),
  zamiennik: text("zamiennik").notNull(),
  dostepnosc_leku: boolean("dostepnosc_leku"),
  dostepnosc_zamiennika: boolean("dostepnosc_zamiennika"),
  data_aktualizacji: timestamp("data_aktualizacji").defaultNow(),
}, (table) => ({
  lekIdx: index("idx_drug_substitutes_lek").on(table.lek_id),
  zamiennikIdx: index("idx_drug_substitutes_zamiennik").on(table.zamiennik_id),
  uniquePair: uniqueIndex("unique_substitute_pair").on(table.lek_id, table.zamiennik_id),
}));

export const drugInteractionsTable = pgTable("drug_interactions", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  drug_id: text("drug_id").notNull().references(() => medicationIndexTable.id_produktu, { onDelete: "cascade" }),
  interaction_text: text("interaction_text").notNull(),
  source: text("source").notNull(),
  section_name: text("section_name"),
  last_updated: timestamp("last_updated").defaultNow(),
}, (table) => ({
  drugIdx: index("idx_drug_interactions_drug").on(table.drug_id),
  uniqueInteraction: uniqueIndex("unique_interaction").on(table.drug_id, table.source),
}));

export const drugSideEffectsTable = pgTable("drug_side_effects", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  drug_id: text("drug_id").notNull().references(() => medicationIndexTable.id_produktu, { onDelete: "cascade" }),
  effect_text: text("effect_text").notNull(),
  source: text("source").notNull(),
  section_name: text("section_name"),
  last_updated: timestamp("last_updated").defaultNow(),
}, (table) => ({
  drugIdx: index("idx_drug_side_effects_drug").on(table.drug_id),
  uniqueEffect: uniqueIndex("unique_side_effect").on(table.drug_id, table.source),
}));

export const medicationDocumentTypeTable = pgTable("medication_document_type", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
})

export const medicationDocumentTable = pgTable("medication_document", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromunit_id: integer("fromunit_id"),
  fromcompany_id: integer("fromcompany_id"),
  tounit_id: integer("tounit_id"),
  tocompany_id: integer("tocompany_id"),
  m_typedoc: varchar("m_typedoc", { length: 20 }).notNull(),
  nr_meddoc: varchar("nr_meddoc", { length: 100 }),
  doc_date: date("doc_date").notNull(),
  status: boolean("status"),
  reason_of_loss: varchar("reason_of_loss", { length: 20 }),
  description: varchar("description", { length: 1000 }),
  purchase_type: varchar("purchase_type", { length: 20 }),
  parent_document_id: integer("parent_document_id"),
  order_date: date("order_date"),
  delivery_date: date("delivery_date"),
  invoice_number: varchar("invoice_number", { length: 30 }),
  type_of_drugs: varchar("type_of_drugs", { length: 20 }),
  correction_document_id: integer("correction_document_id"),
  receiving_user_id: integer("receiving_user_id"),
  issuing_user_id: integer("issuing_user_id"),
  ordering_user_id: integer("ordering_user_id"),
  gross_amount: doublePrecision("gross_amount"),
  med_doc_type: uuid("med_doc_type").references(() => medicationDocumentTypeTable.id, {
	onDelete: "set null",
  }),
});

export const dictionaryAgreementTypeTable = pgTable("dictionary_agreement_type", {
  code: varchar("code", { length: 20 }).primaryKey(),
  description: varchar("description", { length: 100 }).notNull(),
  active: boolean("active").default(true),
  position: integer("position"),
});

export const dictionaryDocumentTypLekuTable = pgTable("dictionary_document_typ_leku", {
  code: varchar("code", { length: 20 }).primaryKey(),
  description: varchar("description", { length: 100 }).notNull(),
  position: integer("position"),
  active: boolean("active").default(true),
});

export const auditLogTable = pgTable("audit_log", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  schema_name: varchar("schema_name", { length: 100 }).notNull(),
  table_name: varchar("table_name", { length: 100 }).notNull(),
  operation: varchar("operation", { length: 1 }).notNull(),
  user_name: varchar("user_name", { length: 100 }).notNull(),
  changed_at: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  old_data: jsonb("old_data"),
  new_data: jsonb("new_data"),
});

export const medDocItemTable = pgTable("med_doc_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  medication_document_id: uuid("medication_document_id").references(() => medicationDocumentTable.id, {
	  onDelete: "set null",
	}),
  //indeks_id: integer("indeks_id"), --ref do tabeli medication -niżej
  medication_id: integer("medication_id").references(() => medicationTable.id, {
	  onDelete: "set null",
	}),
  parent_document_position_id: integer("parent_document_position_id"),
  index_name_id: integer("index_name_id"),
  no: integer("no").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  value: doublePrecision("value").notNull(),
  additional_type: varchar("additional_type", { length: 20 }).notNull(),
  status_quantity: doublePrecision("status_quantity"),
  status_value: doublePrecision("status_value"),
  expiration_date: date("expiration_date"),
  serial_number: varchar("serial_number", { length: 45 }),
  package_code: varchar("package_code", { length: 30 }),
  correction_document_item_id: integer("correction_document_item_id"),
  correction_document_id: integer("correction_document_id"),
  invoice_document_item_id: uuid("invoice_document_item_id").references(() => invoiceItemTable.id, {
	  onDelete: "set null",
	}),
  unit_id: uuid("unit_id").references(() => objectTable.id, {
	  onDelete: "set null",
	}),
  reason_for_loss: varchar("reason_for_loss", { length: 255 }),
  amount_of_loss: doublePrecision("amount_of_loss"),
  value_of_tablet: doublePrecision("value_of_tablet"),
  order_date: date("order_date"),
  last_tablet_value: doublePrecision("last_tablet_value"),
  therapy_program_nip: varchar("therapy_program_nip", { length: 20 }),
  therapy_program_invoice_number: varchar("therapy_program_invoice_number", { length: 30 }),
  therapy_program_item_number: integer("therapy_program_item_number"),
  therapy_program_price: doublePrecision("therapy_program_price"),
  cart_quantity: doublePrecision("cart_quantity"),
  therapy_program_invoice_date: date("therapy_program_invoice_date"),
  therapy_program_active_substance: doublePrecision("therapy_program_active_substance"),
  therapy_program_fzx_version_number: integer("therapy_program_fzx_version_number"),
  storage_location_id: integer("storage_location_id"),
},
  (table) => ({
	invoice_document_item_idIdx: index("idx_invoice_document_item_id").on(
	  table.invoice_document_item_id
	),
	unit_idIdx: index("idx_unit_id").on(
	  table.unit_id
	),
	reason_for_lossIdx: index("idx_reason_for_loss").on(
	  table.reason_for_loss
	),
	amount_of_lossIdx: index("idx_amount_of_loss").on(
	  table.amount_of_loss
	),
	value_of_tabletIdx: index("idx_value_of_tablet").on(
	  table.value_of_tablet
	),
	order_dateIdx: index("idx_order_date").on(
	  table.order_date
	),
	last_tablet_valueIdx: index("idx_last_tablet_value").on(
	  table.last_tablet_value
	),
  }));

  export const medicalEquipmentTypeTable = pgTable("medical_equipment_type", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }),
  })

  export const medicalEquipmentTable = pgTable("medical_equipment", {
	id: uuid("id").primaryKey().defaultRandom(),
	institution_id: integer("institution_id").references(() => firmTable.firm_id, {
	  onDelete: "set null",
	}),
	name: varchar("name", { length: 255 }),
	category_id: uuid("category_id").references(() => medicalEquipmentTypeTable.id, {
	  onDelete: "set null",
	}),
	serial_number: varchar("serial_number", { length: 255 }),
	code: varchar("code", { length: 255 }),
	modality_code: varchar("modality_code", { length: 255 }),
	production_date: timestamp("production_date"),
	purchase_date: timestamp("purchase_date"),
	start_date: timestamp("start_date"),
	user_id: uuid("user_id").references(() => userTable.id, {
	  onDelete: "set null",
	}),
	workplace: varchar("workplace", { length: 255 }),
	ce_certificate: boolean("ce_certificate"),
	medical_device: boolean("medical_device"),
	value: doublePrecision("value"),
	next_inspection_date: timestamp("next_inspection_date"),
	warranty_expiration_date: timestamp("warranty_expiration_date"),
	specification: text("specification"),
	remarks: text("remarks"),
	passport: boolean("passport"),
	decommissioning_date: timestamp("decommissioning_date"),
	inventory_date: timestamp("inventory_date"),
	contact: varchar("contact", { length: 255 }),
	current_service_agreement: varchar("current_service_agreement", { length: 255 }),
	creation_user: uuid("creation_user").references(() => userTable.id, {
	  onDelete: "set null",
	}),
	creation_date: timestamp("creation_date"),
	modify_user: uuid("modify_user").references(() => userTable.id, {
	  onDelete: "set null",
	}),
	modify_date: timestamp("modify_date"),
  })

  export const equipmentIssueTable = pgTable("equipment_issue", {
	id: uuid("id").primaryKey().defaultRandom(),
	equipment_id: uuid("equipment_id").references(() => medicalEquipmentTable.id, {
	  onDelete: "set null",
	}),
	reported_by: uuid("reported_by").references(() => userTable.id, {
	  onDelete: "set null",
	}),
	reported_at: timestamp("reported_at"),
	description: text("description"),
	equipment_issue_status: equipmentIssueStatusEnum("equipment_issue_status")
		.default("none"),
	resolved_by: uuid("resolved_by").references(() => userTable.id, {
	  onDelete: "set null",
	}),
	resolved_at: timestamp("resolved_at"),
	technician_description: text('technician_description'),
	modified_by: uuid("modified_by").references(() => userTable.id, {
	  onDelete: "set null",
	}),
	modified_at: timestamp("modified_at"),
	issue_type: equipmentIssueTypeEnum("equipment_issue_type")
		.default("none"),
  })