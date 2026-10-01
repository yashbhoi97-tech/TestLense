import { PATTERNS, maskSensitiveValue } from './detection/patterns.js';
import { validateLuhn, validatePAN, validateIFSC } from './detection/validators.js';

export function redactText(text) {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // 1. Private keys
  sanitized = sanitized.replace(PATTERNS.privateKey, '[REDACTED PRIVATE KEY BLOCK]');

  // 2. High severity API Keys & tokens
  sanitized = sanitized.replace(PATTERNS.awsKey, '[REDACTED AWS KEY]');
  sanitized = sanitized.replace(PATTERNS.googleApiKey, '[REDACTED GOOGLE API KEY]');
  sanitized = sanitized.replace(PATTERNS.openaiKey, '[REDACTED OPENAI KEY]');
  sanitized = sanitized.replace(PATTERNS.githubToken, '[REDACTED GITHUB TOKEN]');
  sanitized = sanitized.replace(PATTERNS.jwt, '[REDACTED JWT TOKEN]');

  // 3. Secrets / Passwords
  sanitized = sanitized.replace(/(password|passwd|pwd|secret|api_key|access_token|auth_token)\s*([:=]\s*)["']?([^\s"';,]+)["']?/gi, (match, prefix, separator) => {
    return `${prefix}${separator}[REDACTED]`;
  });

  // 4. Payment Cards with Luhn check
  sanitized = sanitized.replace(PATTERNS.paymentCard, (match) => {
    if (validateLuhn(match)) {
      return maskSensitiveValue('paymentCard', match);
    }
    return match;
  });

  // 5. Aadhaar
  sanitized = sanitized.replace(PATTERNS.aadhaar, (match) => {
    return maskSensitiveValue('aadhaar', match);
  });

  // 6. PAN
  sanitized = sanitized.replace(PATTERNS.pan, (match) => {
    if (validatePAN(match)) {
      return maskSensitiveValue('pan', match);
    }
    return match;
  });

  // 7. Phone
  sanitized = sanitized.replace(PATTERNS.phone, (match) => {
    return maskSensitiveValue('phone', match);
  });

  // 8. Email
  sanitized = sanitized.replace(PATTERNS.email, (match) => {
    return maskSensitiveValue('email', match);
  });

  // 9. UPI ID
  sanitized = sanitized.replace(PATTERNS.upiId, (match) => {
    return maskSensitiveValue('upiId', match);
  });

  // 10. IFSC
  sanitized = sanitized.replace(PATTERNS.ifsc, (match) => {
    if (validateIFSC(match)) {
      return maskSensitiveValue('ifsc', match);
    }
    return match;
  });

  // 11. Shortened / Phishing URLs
  sanitized = sanitized.replace(PATTERNS.shortenedUrl, '[SUSPICIOUS SHORT LINK REDACTED]');
  sanitized = sanitized.replace(PATTERNS.ipUrl, '[SUSPICIOUS IP LINK REDACTED]');

  return sanitized;
}
