export function applyTemplate(template: string, content: string, date?: Date): string;
export function parseContent(text: string): { name: string; note: string | undefined };
export function escapeRegex(str: string): string;
export function escapeHtml(str: string): string;
export function stripHtml(html: string): string;
