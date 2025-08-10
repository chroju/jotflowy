import { createBullet, createDailyNote, buildNoteWithTimestamp, WorkflowyAPIError, DailyNoteCache, getTodayDateKey, getCachedDailyNoteUrl, cacheDailyNoteUrl } from './workflowy';
import { html } from './html';
import { getTitleFromUrl, isValidHttpUrl } from './utils';
import { CryptoUtils, getCookie, createSecureCookie } from './crypto-utils';
import { z } from 'zod';

export interface Env {
  ENCRYPTION_KEY?: string; // Master key for API key encryption
  ALLOWED_ORIGINS?: string; // Comma-separated list of allowed origins
}

const requestSchema = z.object({
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

const authSchema = z.object({
  apiKey: z.string().min(1),
  expiration: z.enum(['1hour', '1day', '7days', '30days', 'never', 'custom']).default('30days'),
  customDays: z.number().min(1).max(365).optional(),
}).transform(data => ({
  ...data,
  customDays: data.customDays === null ? undefined : data.customDays
}));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Enable CORS with configurable origins
    const allowedOrigins = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : ['*'];
    const origin = request.headers.get('Origin');
    const allowedOrigin = allowedOrigins.includes('*') ? '*' : (origin && allowedOrigins.includes(origin) ? origin : null);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin || 'null',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle OPTIONS requests for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    switch (path) {
      case '/':
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            ...corsHeaders,
          },
        });

      case '/api/auth':
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        return handleAuth(request, env, corsHeaders);

      case '/api/logout':
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        return handleLogout(request, corsHeaders);

      case '/api/auth/check':
        return handleAuthCheck(request, env, corsHeaders);

      case '/send':
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        return handleSend(request, env, corsHeaders);

      default:
        return new Response('Not found', { 
          status: 404, 
          headers: corsHeaders 
        });
    }
  },
};

async function handleAuth(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    if (!env.ENCRYPTION_KEY) {
      console.error('ENCRYPTION_KEY environment variable is not set');
      return new Response(JSON.stringify({
        error: 'Server configuration error',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
    const masterKey = env.ENCRYPTION_KEY;
    const rawData = await request.json();
    const data = authSchema.parse(rawData);

    // Test API key by making a simple request to Workflowy
    try {
      const testResponse = await fetch('https://workflowy.com/api/me/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.apiKey}`,
        },
      });

      if (!testResponse.ok) {
        return new Response(JSON.stringify({
          error: 'Invalid API key',
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Failed to verify API key',
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Calculate expiration time
    const expirationSeconds = getExpirationSeconds(data.expiration, data.customDays);
    const expirationDate = new Date(Date.now() + expirationSeconds * 1000);

    // Encrypt API key
    const encryptedApiKey = await CryptoUtils.encrypt(data.apiKey, masterKey);
    
    // Create secure cookie
    const cookieHeader = createSecureCookie('auth', encryptedApiKey, expirationSeconds);

    return new Response(JSON.stringify({
      message: 'Authentication successful',
      expiresAt: expirationDate.toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader,
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({
      error: 'Authentication failed',
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

async function handleLogout(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
  const cookieHeader = createSecureCookie('auth', '', 0); // Expire immediately

  return new Response(JSON.stringify({
    message: 'Logged out successfully',
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieHeader,
      ...corsHeaders,
    },
  });
}

async function handleAuthCheck(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    if (!env.ENCRYPTION_KEY) {
      console.error('ENCRYPTION_KEY environment variable is not set');
      return new Response(JSON.stringify({
        error: 'Server configuration error',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
    const masterKey = env.ENCRYPTION_KEY;
    const encryptedApiKey = getCookie(request, 'auth');
    
    if (!encryptedApiKey) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Try to decrypt to verify validity
    await CryptoUtils.decrypt(encryptedApiKey, masterKey);
    
    return new Response(JSON.stringify({ authenticated: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    // Cookie is invalid or expired
    const cookieHeader = createSecureCookie('auth', '', 0); // Clear invalid cookie
    
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader,
        ...corsHeaders,
      },
    });
  }
}

function getExpirationSeconds(expiration: string, customDays?: number | null): number {
  switch (expiration) {
    case '1hour': return 3600;
    case '1day': return 86400;
    case '7days': return 604800;
    case '30days': return 2592000;
    case 'never': return 31536000 * 10; // 10 years
    case 'custom': return (customDays || 30) * 86400;
    default: return 2592000; // 30 days default
  }
}

async function handleSend(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    // Get API key from cookie
    if (!env.ENCRYPTION_KEY) {
      console.error('ENCRYPTION_KEY environment variable is not set');
      return new Response(JSON.stringify({
        error: 'Server configuration error',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
    const masterKey = env.ENCRYPTION_KEY;
    const encryptedApiKey = getCookie(request, 'auth');
    
    if (!encryptedApiKey) {
      return new Response(JSON.stringify({
        error: 'Authentication required',
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    let apiKey: string;
    try {
      apiKey = await CryptoUtils.decrypt(encryptedApiKey, masterKey);
    } catch (error) {
      // Invalid or expired cookie
      const cookieHeader = createSecureCookie('auth', '', 0);
      return new Response(JSON.stringify({
        error: 'Authentication expired',
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
          ...corsHeaders,
        },
      });
    }

    // Parse and validate request
    const rawBody = await request.json();
    const data = requestSchema.parse(rawBody);

    // Process the request with decrypted API key
    const result = await processNoteCreation({ ...data, apiKey });

    return new Response(JSON.stringify({
      message: 'Request accepted',
      dailyNoteUrl: result.dailyNoteUrl,
      new_bullet_url: result.new_bullet_url
    }), { 
      status: 200, 
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error handling send request:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Request validation failed - invalid data format');
      return new Response(JSON.stringify({
        error: 'Invalid request data',
        details: error.issues,
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    if (error instanceof WorkflowyAPIError) {
      console.error('Workflowy API Error:', error.message, error.status);
      
      // Use the original HTTP status code if available, otherwise default to 422
      let responseStatus = 422;
      if (error.status === 401 || error.status === 403 || error.status === 404 || error.status === 429) {
        responseStatus = error.status;
      } else if (error.status && error.status >= 500) {
        responseStatus = error.status;
      }
      
      return new Response(JSON.stringify({
        error: error.message || 'Workflowy API error',
        status: error.status,
      }), {
        status: responseStatus,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    return new Response(JSON.stringify({
      error: 'Internal server error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

async function processNoteCreation(data: z.infer<typeof requestSchema> & { apiKey: string }): Promise<{ dailyNoteUrl?: string; new_bullet_url?: string }> {
  try {
    let title = data.title;
    let saveLocationUrl = data.saveLocationUrl;
    const originalSaveLocationUrl = data.saveLocationUrl; // Keep original for daily note recovery

    // Handle URL title extraction if enabled
    if (data.expandUrls && isValidHttpUrl(title) && !title.includes('x.com')) {
      try {
        const extractedTitle = await getTitleFromUrl(title);
        if (extractedTitle) {
          // Format as Markdown link: [title](url)
          title = `[${extractedTitle}](${title})`;
        }
      } catch (error) {
        console.warn('Failed to extract title from URL:', error);
      }
    }

    // No longer adding #inbox tag as requested

    // Build note content with optional timestamp
    const noteContent = buildNoteWithTimestamp(data.note, data.includeTimestamp);
    let dailyNoteUrl: string | undefined;

    // Handle daily note creation if needed
    if (data.createDaily) {
      try {
        // Check if we already have today's daily note cached
        const cachedUrl = getCachedDailyNoteUrl(data.dailyNoteCache || {});
        
        if (cachedUrl) {
          // Try to use cached daily note URL first
          saveLocationUrl = cachedUrl;
          dailyNoteUrl = cachedUrl;
          console.log('Using cached daily note for today');
        } else {
          // Create new daily note and cache the URL
          const dailyNote = await createDailyNote(data.apiKey, data.saveLocationUrl);
          saveLocationUrl = dailyNote.new_bullet_url;
          dailyNoteUrl = dailyNote.new_bullet_url;
          console.log('Created new daily note with ID:', dailyNote.new_bullet_id);
        }
      } catch (error) {
        console.error('Failed to create daily note:', error);
        
        // Check if this is a location-not-found error
        if (error instanceof WorkflowyAPIError && 
            (error.message.includes('location') || error.message.includes('not found') || error.status === 404)) {
          throw new WorkflowyAPIError(
            `Could not create daily note (${getTodayDateKey()}) at the specified location. Please check that your daily note location exists in Workflowy and try again.`,
            error.status
          );
        }
        
        // For other daily note creation errors, continue with original location
        console.warn('Daily note creation failed, using original location instead');
      }
    }

    // Create the main bullet
    try {
      const result = await createBullet({
        apiKey: data.apiKey,
        title,
        note: noteContent,
        saveLocationUrl,
      });

      console.log('Successfully created bullet with ID:', result.new_bullet_id);

      return { 
        dailyNoteUrl,
        new_bullet_url: result.new_bullet_url 
      };
    } catch (error) {
      
      // If using daily note and getting location-related error, try to recover
      if (data.createDaily && error instanceof WorkflowyAPIError && 
          error.message.toLowerCase().includes('location')) {
        
        console.warn('Daily note appears to have been deleted, attempting to create new one');
        
        try {
          // Create new daily note and retry
          const parentUrl = data.dailyNoteParentUrl || originalSaveLocationUrl;
          const newDailyNote = await createDailyNote(data.apiKey, parentUrl);
          const retryResult = await createBullet({
            apiKey: data.apiKey,
            title,
            note: noteContent,
            saveLocationUrl: newDailyNote.new_bullet_url,
          });
          
          console.log('Successfully created bullet in new daily note with ID:', retryResult.new_bullet_id);
          
          return { 
            dailyNoteUrl: newDailyNote.new_bullet_url,
            new_bullet_url: retryResult.new_bullet_url 
          };
        } catch (retryError) {
          throw new WorkflowyAPIError(
            `Daily note (${getTodayDateKey()}) was not found and could not be recreated. Please check that your daily note location exists in Workflowy and try again.`,
            retryError instanceof WorkflowyAPIError ? retryError.status : 500
          );
        }
      }
      
      // Re-throw original error if not a daily note issue
      throw error;
    }
  } catch (error) {
    console.error('Error processing note creation:', error);
    
    if (error instanceof WorkflowyAPIError) {
      console.error('Workflowy API Error:', error.message, error.status);
    }
    
    // Re-throw the error so it can be caught by handleSend
    throw error;
  }
}