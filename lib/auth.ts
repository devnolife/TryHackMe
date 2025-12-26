import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User, UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface SessionUser {
  id: string;
  userId: string; // Alias for id for backward compatibility
  email: string;
  fullName: string;
  role: UserRole;
  studentId?: string | null;
  department?: string | null;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Convert User model to SessionUser (remove sensitive data)
 */
export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    userId: user.id, // Alias for backward compatibility
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    studentId: user.studentId,
    department: user.department,
  };
}

/**
 * Hash a string using MD5 (for external API compatibility)
 * Note: MD5 is NOT secure for password storage, only used for external API validation
 */
export function hashMD5(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * Verify authentication from request
 * Returns user data if authenticated, error otherwise
 */
export async function verifyAuth(
  request: Request
): Promise<{ authenticated: boolean; user?: SessionUser; error?: string }> {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return { authenticated: false, error: 'No token provided' };
    }

    const payload = verifyToken(token);
    if (!payload) {
      return { authenticated: false, error: 'Invalid token' };
    }

    // Return user data from token
    return {
      authenticated: true,
      user: {
        id: payload.userId,
        userId: payload.userId, // Alias for backward compatibility
        email: payload.email,
        fullName: '', // Will be fetched from DB if needed
        role: payload.role,
      },
    };
  } catch (error) {
    return { authenticated: false, error: 'Authentication failed' };
  }
}
