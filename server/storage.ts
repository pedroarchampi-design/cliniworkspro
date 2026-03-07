import { db } from "./db";
import {
  users,
  consultations,
  type InsertConsultation,
  type Consultation,
  type User,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { username: string; password: string }): Promise<User>;

  getConsultationsByDoctor(doctorId: string): Promise<Consultation[]>;
  getConsultation(id: number): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: { username: string; password: string }): Promise<User> {
    if (!db) {
      return { id: Date.now(), ...insertUser } as User;
    }
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getConsultationsByDoctor(doctorId: string): Promise<Consultation[]> {
    if (!db) return memoryStore.filter(c => c.doctorId === doctorId).reverse();
    return await db
      .select()
      .from(consultations)
      .where(eq(consultations.doctorId, doctorId))
      .orderBy(desc(consultations.createdAt));
  }

  async getConsultation(id: number): Promise<Consultation | undefined> {
    if (!db) return memoryStore.find(c => c.id === id);
    const [consultation] = await db.select().from(consultations).where(eq(consultations.id, id));
    return consultation;
  }

  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    if (!db) {
      const newConsultation: Consultation = {
        id: memoryStore.length + 1,
        doctorId: insertConsultation.doctorId || "demo_doctor",
        patientId: insertConsultation.patientId || null,
        doctorSpecialty: insertConsultation.doctorSpecialty || "Clínica Geral",
        doctorNotes: insertConsultation.doctorNotes || null,
        transcription: insertConsultation.transcription || null,
        hypotheses: insertConsultation.hypotheses || null,
        carePlan: insertConsultation.carePlan || null,
        patientMaterials: insertConsultation.patientMaterials || null,
        imageImpression: insertConsultation.imageImpression || null,
        createdAt: new Date(),
      };
      memoryStore.push(newConsultation);
      return newConsultation;
    }
    const [consultation] = await db.insert(consultations).values(insertConsultation).returning();
    return consultation;
  }
}

// In-memory fallback store
const memoryStore: Consultation[] = [];

export const storage = new DatabaseStorage();
