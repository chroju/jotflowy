// Safe localStorage utilities - extracted for testing

export function safeGetItem(key: string, defaultValue: string | null = null): string | null {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (error) {
    console.warn('Failed to read from localStorage (key: ' + key + '):', error);
    return defaultValue;
  }
}

export function safeParseJSON<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Failed to write to localStorage (key: ' + key + '):', error);
    // Note: In actual app, this would show a toast
    return false;
  }
}

export interface Settings {
  apiKey: string;
  locations: Array<{
    name: string;
    url: string;
    createDaily: boolean;
  }>;
  history: Array<{
    id: string;
    title: string;
    note?: string;
    location: string;
    timestamp: string;
    bulletUrl?: string;
  }>;
  dailyNoteCache: Record<string, string>;
  globalDailyNote?: boolean;
}

export function validateAndRecoverSettings(settings: Settings): { settings: Settings; changed: boolean } {
  let settingsChanged = false;
  const result = { ...settings };
  
  // Validate locations array
  if (!Array.isArray(result.locations)) {
    console.warn('Invalid locations array detected, resetting to empty array');
    result.locations = [];
    settingsChanged = true;
  } else {
    // Validate each location object
    const originalLength = result.locations.length;
    result.locations = result.locations.filter(location => {
      return location && 
             typeof location.name === 'string' && 
             location.name.trim().length > 0 &&
             typeof location.url === 'string' &&
             location.url.includes('workflowy.com');
    });
    if (result.locations.length !== originalLength) {
      settingsChanged = true;
    }
  }
  
  // Validate history array
  if (!Array.isArray(result.history)) {
    console.warn('Invalid history array detected, resetting to empty array');
    result.history = [];
    settingsChanged = true;
  }
  
  // Validate daily note cache
  if (typeof result.dailyNoteCache !== 'object' || result.dailyNoteCache === null) {
    console.warn('Invalid daily note cache detected, resetting to empty object');
    result.dailyNoteCache = {};
    settingsChanged = true;
  }
  
  // Validate API key
  if (typeof result.apiKey !== 'string') {
    console.warn('Invalid API key detected, resetting to empty string');
    result.apiKey = '';
    settingsChanged = true;
  }
  
  return { settings: result, changed: settingsChanged };
}