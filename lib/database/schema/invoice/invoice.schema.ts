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

import { userTable, objectTable } from "../core/core.schema";
import { patientTable } from "../patient/patient.schema";

export const invoiceCategoryEnum = pgEnum("invoice_category", [
  "none",
  "Leki",
  "Sprzęt",
  "Personel",
]);

export const invoicePaymentEnum = pgEnum("invoice_payment", [
  "none",
  "Gotówka",
  "Przelew",
  "Karta",
]);

export const invoiceItemUnitEnum = pgEnum("invoice_item_unit", [
  "szt",
  "kg",
  "gr",
  "ml",
  "l"
]);

export const invoiceItemTaxEnum = pgEnum("invoice_item_tax", [
  "zw",
  "0%",
  "5%",
  "8%",
  "23%"
]);

export const invoiceTaxExemptionBasisEnum = pgEnum("invoice_tax_exemption_basis", [
  "none",
  "Zwolnienei z VAT słownik",
  "Zwolnienie ze względu na nieprzekroczenie 200 000 zł obrotu",
  "Zwolnienie ze względu na rodzaj prowadzonej działalności",
  "Zwolnienie na mocy rozporządzenia MF",
]);

export const invoiceBuyerTypeEnum = pgEnum("invoice_buyer_type", [
  "none",
  "Firma",
  "Płatnik",
  "Pacjent",
]);

export const firmTypeTable = pgTable("firm_type", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
})

export const firmTable = pgTable("firm", {
  firm_id: integer('firm_id').primaryKey().generatedAlwaysAsIdentity(),
  skrot: varchar("skrot", { length: 10 }),
  typ_instytucji: varchar("typ_instytucji", { length: 20 }),
  kod_pocztowy: varchar("kod_pocztowy", { length: 6 }),
  miejscowosc: varchar("miejscowosc", { length: 100 }),
  ulica: varchar("ulica", { length: 201 }),
  nr_domu: varchar("nr_domu", { length: 8 }),
  nr_lokalu: varchar("nr_lokalu", { length: 32 }),
  nr_konta: varchar("nr_konta", { length: 100 }),
  regon: varchar("regon", { length: 9 }),
  nip: varchar("nip", { length: 20 }),
  kod_nfz: varchar("kod_nfz", { length: 5 }),
  kod_gminy: varchar("kod_gminy", { length: 7 }),
  uwagi: varchar("uwagi", { length: 400 }),
  nazwa: varchar("nazwa", { length: 120 }),
  kod_kontrah: varchar("kod_kontrah", { length: 24 }),
  aktywna: boolean("aktywna").default(true),
  platnik_vat: boolean("platnik_vat"),
  email: varchar("email", { length: 256 }),
  regon_drugi_czlon: varchar("regon_drugi_czlon", { length: 5 }),
  id_zewn_instytucja: integer("id_zewn_instytucja"),
  firm_type_id: uuid("firm_type_id").references(() => firmTypeTable.id, {
    onDelete: "set null",
  }),
});

export const agreementTable = pgTable("agreement", {
  agreement_id: integer('agreement_id').primaryKey().generatedAlwaysAsIdentity(),
  company_id: integer("company_id").notNull().references(() => firmTable.firm_id),
  zlec_instytucja_id: integer("zlec_instytucja_id").references(() => firmTable.firm_id),
  nr_agreement: varchar("nr_agreement", { length: 40 }).notNull(),
  descrip_agreement: varchar("descrip_agreement", { length: 40 }),
  type_agreement: varchar("type_agreement", { length: 20 }).notNull(),
  date_from: date("date_from"),
  date_to: date("date_to"),
  sign_date_agreement: date("sign_date_agreement"),
  agreement_sum: doublePrecision("agreement_sum"),
  agreement_order: integer("agreement_order"),
  superior_agreement_id: integer("superior_agreement_id").references((): AnyPgColumn => agreementTable.agreement_id),
  agreement_code_fk: varchar("agreement_code_fk", { length: 20 }),
  current_agreement: boolean("current_agreement").notNull().default(true),
  invoice_prefix: varchar("invoice_prefix", { length: 15 }),
  prefiks_kwitu: varchar("prefiks_kwitu", { length: 15 }),
  agreement_maturity: integer("agreement_maturity"),
  order_delivery_time: integer("order_delivery_time"),
  bank_account: varchar("bank_account", { length: 26 }),
  min_okres_waznosci: integer("min_okres_waznosci"),
});

export const medicationPackageDealTable = pgTable("medication_package_deal", {
  medication_package_deal_id: integer('medication_package_deal_id').primaryKey().generatedAlwaysAsIdentity(),
  agreement_id: integer("agreement_id").notNull().references(() => agreementTable.agreement_id),
  number: integer("number"),
  name: varchar("name", { length: 100 }),
  description: varchar("description", { length: 1000 }),
  limit_amount: doublePrecision("limit_amount"),
  limit_sum: doublePrecision("limit_sum"),
  quantity_used: doublePrecision("quantity_used").default(50),
});

export const tenderItemTable = pgTable("tender_item", {
  tender_item_id: integer('tender_item_id').primaryKey().generatedAlwaysAsIdentity(),
  agreement_id: integer("agreement_id").notNull().references(() => agreementTable.agreement_id),
  lp: integer("lp").notNull(),
  jm_id: integer("jm_id").notNull(),
  ilosc: doublePrecision("ilosc"),
  cena: doublePrecision("cena"),
  wykorzystano_do: date("wykorzystano_do"),
  kod_dostawcy: varchar("kod_dostawcy", { length: 100 }),
  wartosc: doublePrecision("wartosc"),
  ilosc_wykorzystana: doublePrecision("ilosc_wykorzystana"),
  umowa_pakiet_id: integer("umowa_pakiet_id").references(() => medicationPackageDealTable.medication_package_deal_id),
  id_zewn_pozycja_przetarg: integer("id_zewn_pozycja_przetarg"),
  l_change_log_id: integer("l_change_log_id"),
  cena_netto: doublePrecision("cena_netto"),
  rozszerzenie_umowy: varchar("rozszerzenie_umowy", { length: 20 }),
});

export const invoiceTable = pgTable("invoice", {
  invoice_id: uuid("invoice_id").primaryKey().defaultRandom(),
  company_id: integer("company_id").references(() => firmTable.firm_id, {
      onDelete: "set null",
    }),
  patient_id: uuid("patient_id").references(() => patientTable.id, {
      onDelete: "set null",
    }),
  seller_id: integer("seller_id").references(() => firmTable.firm_id, {
      onDelete: "set null",
    }),
  amount: doublePrecision("amount"),
  category: invoiceCategoryEnum("invoice_category")
      .default("none"),
  unit_id: uuid("unit_id")
    .references(() => objectTable.id, { onDelete: "set null" }),
  invoice_number: varchar("invoice_number", { length: 45 }),
  issue_date: timestamp("issue_date"),
  sale_date: timestamp("sale_date"),
  due_date: timestamp("due_date"),
  payment: invoicePaymentEnum("invoice_payment")
      .default("none"),
  description: text("description"),
  payment_recivied: boolean("payment_recivied"),
  issue_location: varchar("issue_location", { length: 90 }),
  bank_account_number: varchar("bank_account_number", { length: 90 }),
  issued_or_received_id: uuid("issued_or_received_id").references(() => userTable.id, {
      onDelete: "set null",
  }),
  tax_exemption_basis: invoiceTaxExemptionBasisEnum("invoice_tax_exemption_basis")
      .default("none"),
  buyer_type: invoiceBuyerTypeEnum("invoice_buyer_type")
      .default("none"),
  issued_place: varchar("issued_place", { length: 90 }),
});

export const invoiceItemTable = pgTable("invoice_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoice_id: uuid("invoice_id").references(() => invoiceTable.invoice_id, {
      onDelete: "set null",
    }),
  lp: integer("lp"),
  name: varchar("name", { length: 90 }),
  count: doublePrecision("count"),
  unit: invoiceItemUnitEnum("invoice_unit")
      .default("szt"),
  net: doublePrecision("net"),
  sum_net: doublePrecision("sum_net"),
  sum_gross: doublePrecision("sum_gross"),
  tax: invoiceItemTaxEnum("invoice_tax")
      .default("23%"),
  discount: doublePrecision("discount"),
  description: text("description"),
})