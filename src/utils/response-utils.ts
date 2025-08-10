import { z } from 'zod';
import { WorkflowyAPIError, CorsHeaders } from '../types';

export function createSuccessResponse(
  data: any,
  corsHeaders: CorsHeaders,
  additionalHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...additionalHeaders,
    },
  });
}

export function createErrorResponse(
  error: string,
  status: number,
  corsHeaders: CorsHeaders,
  details?: any,
  additionalHeaders?: Record<string, string>
): Response {
  const responseBody: any = { error };
  if (details) {
    responseBody.details = details;
  }

  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...additionalHeaders,
    },
  });
}

export function createValidationErrorResponse(
  error: z.ZodError,
  corsHeaders: CorsHeaders
): Response {
  return createErrorResponse(
    'Invalid request data',
    400,
    corsHeaders,
    error.issues
  );
}

export function createWorkflowyErrorResponse(
  error: WorkflowyAPIError,
  corsHeaders: CorsHeaders
): Response {
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

export function createMethodNotAllowedResponse(corsHeaders: CorsHeaders): Response {
  return createErrorResponse('Method not allowed', 405, corsHeaders);
}

export function createNotFoundResponse(corsHeaders: CorsHeaders): Response {
  return createErrorResponse('Not found', 404, corsHeaders);
}

export function createInternalServerErrorResponse(corsHeaders: CorsHeaders): Response {
  return createErrorResponse('Internal server error', 500, corsHeaders);
}

export function createAuthenticationRequiredResponse(corsHeaders: CorsHeaders): Response {
  return createErrorResponse('Authentication required', 401, corsHeaders);
}

export function createAuthenticationExpiredResponse(
  corsHeaders: CorsHeaders,
  cookieHeader?: string
): Response {
  return createErrorResponse(
    'Authentication expired',
    401,
    corsHeaders,
    undefined,
    cookieHeader ? { 'Set-Cookie': cookieHeader } : undefined
  );
}

export function createServerConfigErrorResponse(corsHeaders: CorsHeaders): Response {
  return createErrorResponse('Server configuration error', 500, corsHeaders);
}