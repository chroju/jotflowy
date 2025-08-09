import { createBullet, createDailyNote, buildNoteWithTimestamp, WorkflowyAPIError, DailyNoteCache, getTodayDateKey, getCachedDailyNoteUrl, cacheDailyNoteUrl } from './workflowy';
import { html } from './html';
import { getTitleFromUrl, isValidHttpUrl } from './utils';
import { z } from 'zod';

export interface Env {
  // No bindings needed - all data stored in LocalStorage
}

const requestSchema = z.object({
  title: z.string().min(1),
  note: z.string().default(''),
  saveLocationUrl: z.string().url(),
  saveLocationName: z.string(),
  createDaily: z.boolean().default(false),
  includeTimestamp: z.boolean().default(false),
  expandUrls: z.boolean().default(true),
  apiKey: z.string().min(1),
  dailyNoteCache: z.record(z.string(), z.string()).optional().default({}),
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Enable CORS for all routes
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

      case '/send':
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        return handleSend(request, ctx, corsHeaders);

      default:
        return new Response('Not found', { 
          status: 404, 
          headers: corsHeaders 
        });
    }
  },
};

async function handleSend(request: Request, ctx: ExecutionContext, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    // Parse and validate request
    const rawBody = await request.json();
    const data = requestSchema.parse(rawBody);

    // Process the request and return result
    const result = await processNoteCreation(data);

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

async function processNoteCreation(data: z.infer<typeof requestSchema>): Promise<{ dailyNoteUrl?: string; new_bullet_url?: string }> {
  try {
    let title = data.title;
    let saveLocationUrl = data.saveLocationUrl;

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
          // Use cached daily note URL
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
        // Continue with original location if daily note creation fails
      }
    }

    // Create the main bullet
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
    console.error('Error processing note creation:', error);
    
    if (error instanceof WorkflowyAPIError) {
      console.error('Workflowy API Error:', error.message, error.status);
    }
    
    // Re-throw the error so it can be caught by handleSend
    throw error;
  }
}