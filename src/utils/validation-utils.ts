import { EXPIRATION_TIMES } from '../config';

export function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateWorkflowyUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'workflowy.com' && parsedUrl.hash.startsWith('#/');
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 1000); // Limit length
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function getExpirationSeconds(expiration: string, customDays?: number | null): number {
  if (expiration === 'custom') {
    return (customDays || 30) * 86400;
  }
  
  return EXPIRATION_TIMES[expiration as keyof typeof EXPIRATION_TIMES] || EXPIRATION_TIMES.default;
}