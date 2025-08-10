export const CRYPTO_CONFIG = {
  PBKDF2_ITERATIONS: 100000,
  SALT_LENGTH: 16,
  IV_LENGTH: 12,
  KEY_LENGTH: 256,
} as const;

export const NETWORK_CONFIG = {
  FETCH_TIMEOUT: 5000, // 5 seconds
  ALLOWED_PORTS: ['80', '443', '8080', '8443', ''],
} as const;

export const WORKFLOWY_CONFIG = {
  API_BASE: 'https://workflowy.com/api',
  ENDPOINTS: {
    ME: '/me/',
    BULLETS_CREATE: '/bullets/create/',
  },
} as const;

export const CACHE_CONFIG = {
  DAILY_NOTE_CACHE_DAYS: 7,
} as const;

export const EXPIRATION_TIMES = {
  '1hour': 3600,
  '1day': 86400,
  '7days': 604800,
  '30days': 2592000,
  'never': 31536000 * 10, // 10 years
  'default': 2592000, // 30 days
} as const;