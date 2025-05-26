import { pgTable, text, serial, integer, boolean, date, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (kept from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ADR Report schema
export const adrReports = pgTable("adr_reports", {
  id: serial("id").primaryKey(),
  patientInitials: text("patient_initials").notNull(),
  ageAtEvent: text("age_at_event").notNull(),
  gender: text("gender"),
  weight: text("weight"),
  registrationNumber: text("registration_number"),
  
  // Reaction details
  reactionStartDate: text("reaction_start_date").notNull(),
  reactionStopDate: text("reaction_stop_date"),
  reactionDescription: text("reaction_description").notNull(),
  relevantTests: text("relevant_tests"),
  medicalHistory: text("medical_history"),
  seriousness: jsonb("seriousness").default([]),
  outcome: text("outcome"),
  
  // Medication details
  suspectedMedications: jsonb("suspected_medications").default([]),
  suspectedMedicationName: text("suspected_medication_name").notNull(), // Keeping for backward compatibility
  manufacturer: text("manufacturer"),
  batchNumber: text("batch_number"),
  expiryDate: text("expiry_date"),
  doseUsed: text("dose_used"),
  routeUsed: text("route_used"),
  frequency: text("frequency"),
  therapyStartDate: text("therapy_start_date"),
  therapyEndDate: text("therapy_end_date"),
  indication: text("indication"),
  actionTaken: text("action_taken"),
  reintroductionResult: text("reintroduction_result"),
  reintroductionDose: text("reintroduction_dose"),
  concomitantMedications: text("concomitant_medications"),
  additionalInformation: text("additional_information"),
  
  // Reporter details
  reporterName: text("reporter_name").notNull(),
  reporterAddress: text("reporter_address"),
  reporterAddressLine2: text("reporter_address_line2"),
  pinCode: text("pin_code"),
  reporterEmail: text("reporter_email").notNull(),
  reporterPhone: text("reporter_phone"),
  reporterOccupation: text("reporter_occupation").notNull(),
  reportDate: text("report_date").notNull(),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertADRSchema = createInsertSchema(adrReports);

export type InsertADR = z.infer<typeof insertADRSchema>;
export type ADRReport = typeof adrReports.$inferSelect;

// Calendar events schema
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  eventDate: timestamp("event_date").notNull(),
  eventType: text("event_type").notNull(), // "primary", "secondary", "accent", "muted"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).pick({
  title: true,
  eventDate: true,
  eventType: true,
  description: true,
});

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  message: true,
  response: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
