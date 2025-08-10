import { z } from 'zod';

export interface Env {
  ENCRYPTION_KEY?: string; // Master key for API key encryption
  ALLOWED_ORIGINS?: string; // Comma-separated list of allowed origins
}

export const requestSchema = z.object({
  title: z.string().min(1),
  note: z.string().default(''),
  saveLocationUrl: z.string().url(),
  saveLocationName: z.string(),
  createDaily: z.boolean().default(false),
  includeTimestamp: z.boolean().default(false),
  expandUrls: z.boolean().default(true),
  dailyNoteCache: z.record(z.string(), z.string()).optional().default({}),
  dailyNoteParentUrl: z.string().url().optional(), // Parent location for daily note creation
});

export const authSchema = z.object({
  apiKey: z.string().min(1),
  expiration: z.enum(['1hour', '1day', '7days', '30days', 'never', 'custom']).default('30days'),
  customDays: z.number().min(1).max(365).optional(),
}).transform(data => ({
  ...data,
  customDays: data.customDays === null ? undefined : data.customDays
}));

export type RequestData = z.infer<typeof requestSchema>;
export type AuthData = z.infer<typeof authSchema>;

export interface ProcessNoteResult {
  dailyNoteUrl?: string;
  new_bullet_url?: string;
}

export type CorsHeaders = Record<string, string>;