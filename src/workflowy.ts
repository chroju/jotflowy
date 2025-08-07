export interface CreateBulletRequest {
  apiKey: string;
  title: string;
  note?: string;
  saveLocationUrl: string;
}

export interface CreateBulletResponse {
  save_location_url: string;
  save_location_title: string;
  save_location_note: string;
  new_bullet_url: string;
  new_bullet_title: string;
  new_bullet_children: any[];
  new_bullet_note: string | null;
  new_bullet_id: string;
}

export interface SaveLocation {
  name: string;
  url: string;
  createDaily: boolean;
}

const WORKFLOWY_API_BASE = 'https://workflowy.com/api';

export class WorkflowyAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'WorkflowyAPIError';
  }
}

export async function createBullet(request: CreateBulletRequest): Promise<CreateBulletResponse> {
  try {
    const response = await fetch(`${WORKFLOWY_API_BASE}/bullets/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_bullet_title: request.title,
        save_location_url: request.saveLocationUrl,
        ...(request.note && { new_bullet_note: request.note }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new WorkflowyAPIError(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
        response.status
      );
    }

    const data = await response.json() as CreateBulletResponse;
    return data;
  } catch (error) {
    if (error instanceof WorkflowyAPIError) {
      throw error;
    }
    throw new WorkflowyAPIError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createDailyNote(apiKey: string, journalRootUrl: string): Promise<CreateBulletResponse> {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

  return createBullet({
    apiKey,
    title: dateString,
    note: '', 
    saveLocationUrl: journalRootUrl,
  });
}

export interface DailyNoteCache {
  [date: string]: string; // date -> bullet URL
}

export function getTodayDateKey(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // "2025-01-08"
}

export function getCachedDailyNoteUrl(cache: DailyNoteCache): string | null {
  const todayKey = getTodayDateKey();
  return cache[todayKey] || null;
}

export function cacheDailyNoteUrl(cache: DailyNoteCache, bulletUrl: string): DailyNoteCache {
  const todayKey = getTodayDateKey();
  return {
    ...cache,
    [todayKey]: bulletUrl
  };
}

export function cleanOldDailyNoteCache(cache: DailyNoteCache, daysToKeep: number = 7): DailyNoteCache {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffKey = cutoffDate.toISOString().split('T')[0];
  
  const cleaned: DailyNoteCache = {};
  Object.keys(cache).forEach(dateKey => {
    if (dateKey >= cutoffKey) {
      cleaned[dateKey] = cache[dateKey];
    }
  });
  
  return cleaned;
}

export function buildNoteWithTimestamp(note: string, includeTimestamp: boolean): string {
  if (!includeTimestamp) {
    return note;
  }

  const now = new Date();
  const timestamp = now.toLocaleString('sv-SE', {
    timeZone: 'Asia/Tokyo',
  }).slice(0, 16); // "2025-01-08 14:30"

  if (note.trim() === '') {
    return timestamp;
  }

  return `${timestamp}\n\n${note}`;
}