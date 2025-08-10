import { createSecureCookie } from '../crypto-utils';
import { createSuccessResponse } from '../utils/response-utils';
import { CorsHeaders } from '../types';

export async function handleLogout(request: Request, corsHeaders: CorsHeaders): Promise<Response> {
  const cookieHeader = createSecureCookie('auth', '', 0); // Expire immediately

  return createSuccessResponse(
    { message: 'Logged out successfully' },
    corsHeaders,
    { 'Set-Cookie': cookieHeader }
  );
}