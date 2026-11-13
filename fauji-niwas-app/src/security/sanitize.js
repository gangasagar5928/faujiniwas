import DOMPurify from 'dompurify';

/**
 * Security & Sanitization Engine
 * Protects against Stored, Reflected, and DOM-based Cross-Site Scripting (XSS).
 */

/**
 * Escapes unsafe HTML characters into safe HTML entities.
 * Use for string interpolation into HTML templates.
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips all HTML tags and suspicious protocols, returning pure plain text.
 * Trims excess whitespace.
 */
export function sanitizeText(str, maxLength = 1000) {
  if (!str) return '';
  const cleaned = String(str)
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitizes rich HTML content using DOMPurify with strict whitelist.
 */
export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml) return '';
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'ul', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
    SAFE_FOR_TEMPLATES: true,
  });
}

/**
 * Validates and sanitizes a complete rental or marketplace listing object.
 * Enforces schema boundaries and prevents field injection.
 */
export function sanitizeListingData(form) {
  return {
    name: sanitizeText(form.name, 120),
    area: sanitizeText(form.area, 100),
    city: sanitizeText(form.city, 60),
    type: sanitizeText(form.type, 30),
    phone: sanitizeText(form.phone, 15).replace(/[^\d+]/g, ''),
    ownerType: ['defence', 'civilian', 'individual', 'family'].includes(form.ownerType)
      ? form.ownerType
      : 'civilian',
    furnishing: ['Furnished', 'Semi', 'Unfurnished'].includes(form.furnishing)
      ? form.furnishing
      : 'Semi',
    bhk: sanitizeText(form.bhk || '1', 10),
    available: sanitizeText(form.available, 50),
    petFriendly: Boolean(form.petFriendly),
    category: sanitizeText(form.category, 50),
    condition: sanitizeText(form.condition, 30),
    negotiable: Boolean(form.negotiable),
  };
}
