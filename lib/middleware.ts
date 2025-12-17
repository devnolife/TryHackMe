import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

/**
 * Middleware to authenticate requests
 */
export async function authenticate(
  request: NextRequest
): Promise<{ authenticated: boolean; user?: TokenPayload; response?: NextResponse }> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      ),
    };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Invalid authorization header format' },
        { status: 401 }
      ),
    };
  }

  const token = parts[1];
  const user = verifyToken(token);

  if (!user) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    user,
  };
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Middleware to check authorization (role-based)
 */
export function authorize(
  user: TokenPayload,
  allowedRoles: string[]
): { authorized: boolean; response?: NextResponse } {
  if (!hasRole(user.role, allowedRoles)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}
