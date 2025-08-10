import { CryptoUtils, getCookie, createSecureCookie } from '../crypto-utils';
import { 
  createSuccessResponse, 
  createServerConfigErrorResponse 
} from '../utils/response-utils';
import { Env, CorsHeaders } from '../types';

export async function handleAuthCheck(request: Request, env: Env, corsHeaders: CorsHeaders): Promise<Response> {
  try {
    if (!env.ENCRYPTION_KEY) {
      console.error('ENCRYPTION_KEY environment variable is not set');
      return createServerConfigErrorResponse(corsHeaders);
    }
    
    const masterKey = env.ENCRYPTION_KEY;
    const encryptedApiKey = getCookie(request, 'auth');
    
    if (!encryptedApiKey) {
      return createSuccessResponse({ authenticated: false }, corsHeaders);
    }

    // Try to decrypt to verify validity
    await CryptoUtils.decrypt(encryptedApiKey, masterKey);
    
    return createSuccessResponse({ authenticated: true }, corsHeaders);
  } catch (error) {
    // Cookie is invalid or expired
    const cookieHeader = createSecureCookie('auth', '', 0); // Clear invalid cookie
    
    return createSuccessResponse(
      { authenticated: false },
      corsHeaders,
      { 'Set-Cookie': cookieHeader }
    );
  }
}