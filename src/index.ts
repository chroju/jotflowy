import { html } from './html';
import { handleAuth, handleLogout, handleAuthCheck, handleSend } from './handlers';
import { createMethodNotAllowedResponse, createNotFoundResponse } from './utils/response-utils';
import { Env, CorsHeaders } from './types';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Enable CORS with configurable origins
    const corsHeaders = createCorsHeaders(request, env);

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
          return createMethodNotAllowedResponse(corsHeaders);
        }
        return handleAuth(request, env, corsHeaders);

      case '/api/logout':
        if (request.method !== 'POST') {
          return createMethodNotAllowedResponse(corsHeaders);
        }
        return handleLogout(request, corsHeaders);

      case '/api/auth/check':
        return handleAuthCheck(request, env, corsHeaders);

      case '/send':
        if (request.method !== 'POST') {
          return createMethodNotAllowedResponse(corsHeaders);
        }
        return handleSend(request, env, corsHeaders);

      default:
        return createNotFoundResponse(corsHeaders);
    }
  },
};

function createCorsHeaders(request: Request, env: Env): CorsHeaders {
  const allowedOrigins = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : ['*'];
  const origin = request.headers.get('Origin');
  const allowedOrigin = allowedOrigins.includes('*') ? '*' : (origin && allowedOrigins.includes(origin) ? origin : null);
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin || 'null',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}