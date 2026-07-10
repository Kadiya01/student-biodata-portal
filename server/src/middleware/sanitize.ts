import { Request, Response, NextFunction } from 'express';

const HTML_ENTITY_RE = /&#?\w+;|&#x[\da-fA-F]+;/g;

function decodeEntities(input: string): string {
  return input.replace(HTML_ENTITY_RE, (match) => {
    try {
      if (match.startsWith('&#x') || match.startsWith('&#X')) {
        return String.fromCharCode(parseInt(match.slice(3, -1), 16));
      }
      if (match.startsWith('&#')) {
        return String.fromCharCode(parseInt(match.slice(2, -1), 10));
      }
      return match;
    } catch {
      return match;
    }
  });
}

function stripHtml(input: string): string {
  let s = decodeEntities(input);
  s = s.replace(/<[^>]*>/g, '');
  s = s.replace(/javascript\s*:/gi, '');
  s = s.replace(/vbscript\s*:/gi, '');
  s = s.replace(/data\s*:[^,]*;base64/gi, '');
  s = s.replace(/\bon\w+\s*=\s*(['"])[^'"]*\1/gi, '');
  s = s.replace(/\bon\w+\s*=\s*\S+/gi, '');
  s = s.replace(/expression\s*\(/gi, '');
  s = s.replace(/url\s*\(\s*['"]?\s*javascript/gi, '');
  return s.trim();
}

function sanitizeValue(value: any): any {
  if (typeof value === 'string') return stripHtml(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }
  return value;
}

export function sanitize(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    for (const [key, val] of Object.entries(req.query)) {
      if (typeof val === 'string') {
        (req.query as any)[key] = stripHtml(val);
      }
    }
  }
  next();
}
