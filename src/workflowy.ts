import { 
  CreateBulletRequest, 
  CreateBulletResponse, 
  WorkflowyAPIError, 
  DailyNoteCache 
} from './types';
import { WORKFLOWY_CONFIG, CACHE_CONFIG } from './config';

// Re-export types for backward compatibility
export { CreateBulletRequest, CreateBulletResponse, WorkflowyAPIError, DailyNoteCache };

export async function createBullet(request: CreateBulletRequest): Promise<CreateBulletResponse> {
  try {
    const response = await fetch(`${WORKFLOWY_CONFIG.API_BASE}${WORKFLOWY_CONFIG.ENDPOINTS.BULLETS_CREATE}`, {
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
  // Use getTodayDateKey for consistency with caching logic
  const dateString = getTodayDateKey(); // YYYY-MM-DD format

  return createBullet({
    apiKey,
    title: dateString,
    note: '', 
    saveLocationUrl: journalRootUrl,
  });
}


export function getTodayDateKey(): string {
  const today = new Date();
  // Use local date instead of UTC to avoid timezone issues
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

export function cleanOldDailyNoteCache(cache: DailyNoteCache, daysToKeep: number = CACHE_CONFIG.DAILY_NOTE_CACHE_DAYS): DailyNoteCache {
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
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).slice(0, 16); // "2025-01-08 14:30"

  if (note.trim() === '') {
    return timestamp;
  }

  return `${timestamp}\n\n${note}`;
}