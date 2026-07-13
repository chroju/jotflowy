export function applyTemplate(template: string, content: string, date?: Date): string;
export function parseContent(text: string): { name: string; note: string | undefined };
export function escapeRegex(str: string): string;
export function escapeHtml(str: string): string;
export function stripHtml(html: string): string;
export function sanitizeHtml(html: string): string;
export const FONT_FAMILY_MAP: Record<string, string>;
export function migrateSettings<T extends { destinations?: unknown[] }>(settings: T): { settings: T; changed: boolean };
export function applyTypographySettings(settings: { fontSize?: number; lineHeight?: number; fontFamily?: string }): void;
