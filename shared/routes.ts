import { z } from 'zod';
import { insertConsultationSchema, consultations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  consultations: {
    list: {
      method: 'GET' as const,
      path: '/api/consultations' as const,
      input: z.object({
        doctorId: z.string().optional()
      }).optional(),
      responses: {
        200: z.object({
          consultations: z.array(z.custom<typeof consultations.$inferSelect>())
        }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/consultations' as const,
      input: z.object({
        doctorId: z.string(),
        patientId: z.string().optional(),
        doctorSpecialty: z.string(),
        doctorNotes: z.string().optional(),
        audioBase64: z.string().optional(),
        imageBase64: z.string().optional(),
      }),
      responses: {
        201: z.object({
          status: z.string(),
          consultationId: z.number(),
          data: z.custom<typeof consultations.$inferSelect>().optional()
        }),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/consultations/:id' as const,
      responses: {
        200: z.custom<typeof consultations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  subscription: {
    checkout: {
      method: 'POST' as const,
      path: '/api/subscription/checkout' as const,
      input: z.object({
        plan: z.string(),
        doctorId: z.string()
      }),
      responses: {
        200: z.object({ checkout_url: z.string() }),
        400: errorSchemas.validation,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ConsultationInput = z.infer<typeof api.consultations.create.input>;
export type ConsultationsListResponse = z.infer<typeof api.consultations.list.responses[200]>;
