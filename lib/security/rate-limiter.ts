/**
 * Rate Limiting Middleware
 * Protects against brute-force attacks and API abuse
 */

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  message?: string;      // Custom error message
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  skipFailedRequests?: boolean;      // Don't count failed requests
  keyGenerator?: (request: Request) => string;  // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// In-memory store (should use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Strict limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,           // 5 attempts
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },

  // Standard API limit
  api: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,         // 100 requests per minute
    message: 'Too many requests. Please slow down.',
  },

  // Strict limit for password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,           // 3 attempts
    message: 'Too many password reset attempts. Please try again later.',
  },

  // Command execution limit
  commands: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 60,          // 60 commands per minute (1 per second average)
    message: 'Command rate limit exceeded. Please slow down.',
  },

  // Report generation limit
  reports: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,          // 10 reports per hour
    message: 'Report generation limit exceeded. Please try again later.',
  },
} as const;

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

/**
 * Get client identifier from request
 */
function getClientKey(request: Request, customKey?: string): string {
  // Use custom key if provided
  if (customKey) {
    return customKey;
  }

  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  // Use the first available IP
  const ip = forwarded?.split(',')[0]?.trim() ||
    realIp ||
    cfConnectingIp ||
    'unknown';

  return ip;
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig,
  customKey?: string
): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
  const clientKey = getClientKey(request, customKey);
  const endpoint = new URL(request.url).pathname;
  const key = `${clientKey}:${endpoint}`;

  const now = Date.now();
  let entry = rateLimitStore.get(key);

  // Create new entry if doesn't exist or has expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false,
    };
    rateLimitStore.set(key, entry);
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    entry.blocked = true;
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware for API routes
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  return function (request: Request, customKey?: string): Response | null {
    const result = checkRateLimit(request, config, customKey);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: config.message || 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': result.retryAfter?.toString() || '',
          },
        }
      );
    }

    // Return null to indicate request is allowed
    return null;
  };
}

/**
 * Create rate limited API handler
 */
export function withRateLimit<T>(
  handler: (request: Request) => Promise<Response>,
  config: RateLimitConfig
): (request: Request) => Promise<Response> {
  return async function (request: Request): Promise<Response> {
    const middleware = rateLimitMiddleware(config);
    const limitResponse = middleware(request);

    if (limitResponse) {
      return limitResponse;
    }

    // Add rate limit headers to successful response
    const result = checkRateLimit(request, config);
    const response = await handler(request);

    // Clone response to add headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    newResponse.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    newResponse.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return newResponse;
  };
}

/**
 * Login-specific rate limiter with progressive delays
 */
export class LoginRateLimiter {
  private attempts = new Map<string, { count: number; lastAttempt: number; lockoutUntil?: number }>();

  private readonly maxAttempts = 5;
  private readonly lockoutDurations = [
    1 * 60 * 1000,    // 1 minute after 5 failed attempts
    5 * 60 * 1000,    // 5 minutes after 10 failed attempts
    15 * 60 * 1000,   // 15 minutes after 15 failed attempts
    60 * 60 * 1000,   // 1 hour after 20 failed attempts
  ];

  /**
   * Record a failed login attempt
   */
  recordFailedAttempt(identifier: string): { locked: boolean; lockoutRemaining?: number } {
    const now = Date.now();
    let record = this.attempts.get(identifier);

    if (!record) {
      record = { count: 0, lastAttempt: now };
      this.attempts.set(identifier, record);
    }

    // Check if currently locked out
    if (record.lockoutUntil && now < record.lockoutUntil) {
      return {
        locked: true,
        lockoutRemaining: Math.ceil((record.lockoutUntil - now) / 1000),
      };
    }

    // Reset if last attempt was more than 1 hour ago
    if (now - record.lastAttempt > 60 * 60 * 1000) {
      record.count = 0;
    }

    record.count++;
    record.lastAttempt = now;

    // Calculate lockout tier based on failed attempts
    const lockoutTier = Math.floor((record.count - 1) / this.maxAttempts);

    if (record.count % this.maxAttempts === 0 && lockoutTier < this.lockoutDurations.length) {
      const lockoutDuration = this.lockoutDurations[lockoutTier];
      record.lockoutUntil = now + lockoutDuration;

      return {
        locked: true,
        lockoutRemaining: Math.ceil(lockoutDuration / 1000),
      };
    }

    return { locked: false };
  }

  /**
   * Reset attempts after successful login
   */
  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Check if identifier is currently locked out
   */
  isLockedOut(identifier: string): { locked: boolean; lockoutRemaining?: number } {
    const record = this.attempts.get(identifier);
    const now = Date.now();

    if (record?.lockoutUntil && now < record.lockoutUntil) {
      return {
        locked: true,
        lockoutRemaining: Math.ceil((record.lockoutUntil - now) / 1000),
      };
    }

    return { locked: false };
  }

  /**
   * Get remaining attempts before lockout
   */
  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return this.maxAttempts;

    return Math.max(0, this.maxAttempts - (record.count % this.maxAttempts));
  }
}

// Singleton instance for login rate limiting
export const loginRateLimiter = new LoginRateLimiter();

/**
 * IP-based blocking for repeated abuse
 */
export class IPBlocker {
  private blockedIPs = new Map<string, { until: number; reason: string }>();

  /**
   * Block an IP address
   */
  block(ip: string, durationMs: number, reason: string): void {
    this.blockedIPs.set(ip, {
      until: Date.now() + durationMs,
      reason,
    });
  }

  /**
   * Check if IP is blocked
   */
  isBlocked(ip: string): { blocked: boolean; reason?: string; remainingMs?: number } {
    const record = this.blockedIPs.get(ip);
    const now = Date.now();

    if (record && now < record.until) {
      return {
        blocked: true,
        reason: record.reason,
        remainingMs: record.until - now,
      };
    }

    // Clean up expired block
    if (record) {
      this.blockedIPs.delete(ip);
    }

    return { blocked: false };
  }

  /**
   * Unblock an IP address
   */
  unblock(ip: string): void {
    this.blockedIPs.delete(ip);
  }
}

export const ipBlocker = new IPBlocker();

export default {
  checkRateLimit,
  rateLimitMiddleware,
  withRateLimit,
  loginRateLimiter,
  ipBlocker,
  RATE_LIMIT_CONFIGS,
};
