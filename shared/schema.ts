import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  plan: text("plan").notNull().default("demo"),
});

export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  doctorId: text("doctor_id").notNull(),
  patientId: text("patient_id"),
  doctorSpecialty: text("doctor_specialty").notNull(),
  doctorNotes: text("doctor_notes"),
  transcription: text("transcription"),
  hypotheses: jsonb("hypotheses"), // { rank, condition, reasoning, probability }[]
  carePlan: jsonb("care_plan"), // { immediate_actions, exams, prescription, follow_up }
  imageImpression: text("image_impression"),
  patientMaterials: jsonb("patient_materials"), // { simple_explanation, daily_guidelines, alert_signs, faq }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({ 
  id: true, 
  createdAt: true 
});

export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type User = typeof users.$inferSelect;

export type CreateConsultationRequest = {
  doctorId: string;
  patientId?: string;
  doctorSpecialty: string;
  doctorNotes?: string;
  audioBase64?: string;
  imageBase64?: string;
};
