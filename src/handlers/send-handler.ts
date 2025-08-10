import { CryptoUtils, getCookie, createSecureCookie } from '../crypto-utils';
import { 
  createSuccessResponse,
  createValidationErrorResponse,
  createWorkflowyErrorResponse,
  createInternalServerErrorResponse,
  createServerConfigErrorResponse,
  createAuthenticationRequiredResponse,
  createAuthenticationExpiredResponse
} from '../utils/response-utils';
import { processNoteCreation } from './note-processor';
import { Env, CorsHeaders, requestSchema, WorkflowyAPIError } from '../types';
import { z } from 'zod';

export async function handleSend(request: Request, env: Env, corsHeaders: CorsHeaders): Promise<Response> {
  try {
    // Get API key from cookie
    if (!env.ENCRYPTION_KEY) {
      console.error('ENCRYPTION_KEY environment variable is not set');
      return createServerConfigErrorResponse(corsHeaders);
    }
    
    const masterKey = env.ENCRYPTION_KEY;
    const encryptedApiKey = getCookie(request, 'auth');
    
    if (!encryptedApiKey) {
      return createAuthenticationRequiredResponse(corsHeaders);
    }

    let apiKey: string;
    try {
      apiKey = await CryptoUtils.decrypt(encryptedApiKey, masterKey);
    } catch (error) {
      // Invalid or expired cookie
      const cookieHeader = createSecureCookie('auth', '', 0);
      return createAuthenticationExpiredResponse(corsHeaders, cookieHeader);
    }

    // Parse and validate request
    const rawBody = await request.json();
    const data = requestSchema.parse(rawBody);

    // Process the request with decrypted API key
    const result = await processNoteCreation({ ...data, apiKey });

    return createSuccessResponse({
      message: 'Request accepted',
      dailyNoteUrl: result.dailyNoteUrl,
      new_bullet_url: result.new_bullet_url
    }, corsHeaders);
  } catch (error) {
    console.error('Error handling send request:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Request validation failed - invalid data format');
      return createValidationErrorResponse(error, corsHeaders);
    }

    if (error instanceof WorkflowyAPIError) {
      console.error('Workflowy API Error:', error.message, error.status);
      return createWorkflowyErrorResponse(error, corsHeaders);
    }

    return createInternalServerErrorResponse(corsHeaders);
  }
}