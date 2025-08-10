import { CryptoUtils, createSecureCookie } from '../crypto-utils';
import { WORKFLOWY_CONFIG } from '../config';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  createServerConfigErrorResponse
} from '../utils/response-utils';
import { getExpirationSeconds } from '../utils/validation-utils';
import { Env, CorsHeaders, authSchema } from '../types';
import { z } from 'zod';

export async function handleAuth(request: Request, env: Env, corsHeaders: CorsHeaders): Promise<Response> {
  try {
    if (!env.ENCRYPTION_KEY) {
      console.error('ENCRYPTION_KEY environment variable is not set');
      return createServerConfigErrorResponse(corsHeaders);
    }
    
    const masterKey = env.ENCRYPTION_KEY;
    const rawData = await request.json();
    const data = authSchema.parse(rawData);

    // Test API key by making a simple request to Workflowy
    try {
      const testResponse = await fetch(`${WORKFLOWY_CONFIG.API_BASE}${WORKFLOWY_CONFIG.ENDPOINTS.ME}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.apiKey}`,
        },
      });

      if (!testResponse.ok) {
        return createErrorResponse('Invalid API key', 401, corsHeaders);
      }
    } catch (error) {
      return createErrorResponse('Failed to verify API key', 400, corsHeaders);
    }

    // Calculate expiration time
    const expirationSeconds = getExpirationSeconds(data.expiration, data.customDays);
    const expirationDate = new Date(Date.now() + expirationSeconds * 1000);

    // Encrypt API key
    const encryptedApiKey = await CryptoUtils.encrypt(data.apiKey, masterKey);
    
    // Create secure cookie
    const cookieHeader = createSecureCookie('auth', encryptedApiKey, expirationSeconds);

    return createSuccessResponse(
      {
        message: 'Authentication successful',
        expiresAt: expirationDate.toISOString(),
      },
      corsHeaders,
      { 'Set-Cookie': cookieHeader }
    );
  } catch (error) {
    console.error('Auth error:', error);
    
    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error, corsHeaders);
    }
    
    return createErrorResponse('Authentication failed', 400, corsHeaders);
  }
}