/**
 * Input Sanitization Utilities
 * Protects against injection attacks and malicious input
 */

/**
 * HTML entity encoding map
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * SQL injection patterns to detect
 */
const SQL_INJECTION_PATTERNS = [
  /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE|UNION|OR|AND)\s/i,
  /('|")\s*(OR|AND)\s*('|")/i,
  /--\s*$/,
  /\/\*.*\*\//,
  /;\s*(DROP|DELETE|TRUNCATE|INSERT|UPDATE)/i,
  /'\s*(OR|AND)\s*'?\d+'\s*=\s*'\d+/i,
  /'\s*(OR|AND)\s*1\s*=\s*1/i,
  /WAITFOR\s+DELAY/i,
  /BENCHMARK\s*\(/i,
  /SLEEP\s*\(/i,
];

/**
 * XSS attack patterns to detect
 */
const XSS_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /<script[^>]*>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /<iframe[^>]*>/gi,
  /<object[^>]*>/gi,
  /<embed[^>]*>/gi,
  /<svg[^>]*onload/gi,
  /expression\s*\(/gi,
  /url\s*\(\s*['"]?\s*javascript:/gi,
];

/**
 * Command injection patterns to detect
 */
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$(){}[\]<>]/,
  /\$\(.*\)/,
  /`.*`/,
  /\|\|/,
  /&&/,
  /\n/,
  /\r/,
  /\0/,
];

/**
 * Path traversal patterns to detect
 */
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\$/g,
  /%2e%2e%2f/gi,
  /%2e%2e\//gi,
  /\.\.%2f/gi,
  /%2e%2e%5c/gi,
  /\.\.\\/g,
  /~\//,
];

export interface SanitizationResult {
  sanitized: string;
  original: string;
  modified: boolean;
  threats: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  threats: string[];
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`=\/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(input: string): string {
  const reverseEntities: Record<string, string> = {};
  for (const [char, entity] of Object.entries(HTML_ENTITIES)) {
    reverseEntities[entity] = char;
  }

  return input.replace(/&(amp|lt|gt|quot|#x27|#x2F|#x60|#x3D);/g,
    (match) => reverseEntities[match] || match
  );
}

/**
 * Sanitize string for safe HTML output
 */
export function sanitizeHtml(input: string): SanitizationResult {
  const threats: string[] = [];
  let sanitized = input;

  // Check for XSS patterns
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      threats.push(`XSS pattern detected: ${pattern.source}`);
    }
  }

  // Remove dangerous tags and attributes
  sanitized = sanitized
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '');

  // Escape remaining HTML
  sanitized = escapeHtml(sanitized);

  return {
    sanitized,
    original: input,
    modified: sanitized !== input,
    threats,
  };
}

/**
 * Sanitize input for SQL queries (use parameterized queries instead when possible)
 */
export function sanitizeSql(input: string): SanitizationResult {
  const threats: string[] = [];
  let sanitized = input;

  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      threats.push(`SQL injection pattern detected: ${pattern.source}`);
    }
  }

  // Escape SQL special characters
  sanitized = sanitized
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\x00/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');

  return {
    sanitized,
    original: input,
    modified: sanitized !== input,
    threats,
  };
}

/**
 * Sanitize command input for terminal execution
 */
export function sanitizeCommand(input: string): SanitizationResult {
  const threats: string[] = [];
  let sanitized = input;

  // Only allow safe command characters for the lab environment
  // This is specifically for the simulated terminal, not real shell execution
  const allowedPattern = /^[a-zA-Z0-9\s\-_./:@='"]+$/;

  if (!allowedPattern.test(input)) {
    for (const pattern of COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        threats.push(`Command injection pattern detected`);
        break;
      }
    }
  }

  // For the simulated environment, we allow most input but log suspicious patterns
  // The command router handles execution safely

  return {
    sanitized: input.trim(),
    original: input,
    modified: false,
    threats,
  };
}

/**
 * Sanitize file paths to prevent traversal attacks
 */
export function sanitizePath(input: string): SanitizationResult {
  const threats: string[] = [];
  let sanitized = input;

  // Check for path traversal patterns
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(input)) {
      threats.push('Path traversal attempt detected');
      break;
    }
  }

  // Remove dangerous path components
  sanitized = sanitized
    .replace(/\.\.\//g, '')
    .replace(/\.\.\\$/g, '')
    .replace(/%2e%2e%2f/gi, '')
    .replace(/%2e%2e%5c/gi, '')
    .replace(/^~\//, '')
    .replace(/^\/+/, '');

  // Normalize path
  sanitized = sanitized.replace(/\/+/g, '/');

  return {
    sanitized,
    original: input,
    modified: sanitized !== input,
    threats,
  };
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: string): SanitizationResult {
  const threats: string[] = [];
  let sanitized = input.trim().toLowerCase();

  // Basic email format validation
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(sanitized)) {
    threats.push('Invalid email format');
  }

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>"'`;(){}[\]]/g, '');

  return {
    sanitized,
    original: input,
    modified: sanitized !== input,
    threats,
  };
}

/**
 * Sanitize username
 */
export function sanitizeUsername(input: string): SanitizationResult {
  const threats: string[] = [];
  let sanitized = input.trim();

  // Only allow alphanumeric, underscore, hyphen, and dot
  const usernamePattern = /^[a-zA-Z0-9._-]+$/;

  if (!usernamePattern.test(sanitized)) {
    threats.push('Invalid username format');
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '');
  }

  // Length validation
  if (sanitized.length < 3) {
    threats.push('Username too short (minimum 3 characters)');
  }
  if (sanitized.length > 50) {
    threats.push('Username too long (maximum 50 characters)');
    sanitized = sanitized.substring(0, 50);
  }

  return {
    sanitized,
    original: input,
    modified: sanitized !== input,
    threats,
  };
}

/**
 * Validate and sanitize JSON input
 */
export function sanitizeJson(input: string): SanitizationResult & { parsed?: unknown } {
  const threats: string[] = [];
  let sanitized = input;
  let parsed: unknown;

  try {
    parsed = JSON.parse(input);
    sanitized = JSON.stringify(parsed);
  } catch (e) {
    threats.push('Invalid JSON format');
    return {
      sanitized: '{}',
      original: input,
      modified: true,
      threats,
    };
  }

  return {
    sanitized,
    original: input,
    modified: sanitized !== input,
    threats,
    parsed,
  };
}

/**
 * Comprehensive input validation
 */
export function validateInput(
  input: string,
  options: {
    type?: 'text' | 'email' | 'username' | 'command' | 'path' | 'json';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
  } = {}
): ValidationResult {
  const errors: string[] = [];
  const threats: string[] = [];

  // Required check
  if (options.required && (!input || input.trim() === '')) {
    errors.push('This field is required');
    return { valid: false, errors, threats };
  }

  // If empty and not required, return valid
  if (!input || input.trim() === '') {
    return { valid: true, errors, threats };
  }

  // Length checks
  if (options.minLength && input.length < options.minLength) {
    errors.push(`Minimum length is ${options.minLength} characters`);
  }
  if (options.maxLength && input.length > options.maxLength) {
    errors.push(`Maximum length is ${options.maxLength} characters`);
  }

  // Pattern check
  if (options.pattern && !options.pattern.test(input)) {
    errors.push('Input format is invalid');
  }

  // Type-specific validation
  switch (options.type) {
    case 'email': {
      const result = sanitizeEmail(input);
      threats.push(...result.threats);
      break;
    }
    case 'username': {
      const result = sanitizeUsername(input);
      threats.push(...result.threats);
      break;
    }
    case 'command': {
      const result = sanitizeCommand(input);
      threats.push(...result.threats);
      break;
    }
    case 'path': {
      const result = sanitizePath(input);
      threats.push(...result.threats);
      break;
    }
    case 'json': {
      const result = sanitizeJson(input);
      threats.push(...result.threats);
      break;
    }
    default: {
      // Check for common injection patterns in general text
      const htmlResult = sanitizeHtml(input);
      threats.push(...htmlResult.threats);
      break;
    }
  }

  return {
    valid: errors.length === 0 && threats.length === 0,
    errors,
    threats,
  };
}

/**
 * Strip all HTML tags from input
 */
export function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Normalize whitespace in input
 */
export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Truncate string safely (not in middle of word or HTML entity)
 */
export function truncate(input: string, maxLength: number, suffix = '...'): string {
  if (input.length <= maxLength) return input;

  const truncated = input.substring(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + suffix;
  }

  return truncated + suffix;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: { escapeHtml?: boolean; stripTags?: boolean } = { escapeHtml: true }
): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      let sanitizedValue = value;
      if (options.stripTags) {
        sanitizedValue = stripTags(sanitizedValue);
      }
      if (options.escapeHtml) {
        sanitizedValue = escapeHtml(sanitizedValue);
      }
      sanitized[key] = sanitizedValue;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>, options)
          : typeof item === 'string'
            ? options.escapeHtml
              ? escapeHtml(item)
              : item
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

export default {
  escapeHtml,
  unescapeHtml,
  sanitizeHtml,
  sanitizeSql,
  sanitizeCommand,
  sanitizePath,
  sanitizeEmail,
  sanitizeUsername,
  sanitizeJson,
  validateInput,
  stripTags,
  normalizeWhitespace,
  truncate,
  sanitizeObject,
};
