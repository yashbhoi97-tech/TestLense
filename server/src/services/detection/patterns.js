export const PATTERNS = {
  // PII - Identity & Contact
  aadhaar: /\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b/g,
  pan: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
  phone: /(?:\+91[\-\s]?)?[6-9]\d{9}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  passport: /\b[A-PR-WYa-pr-wy][1-9]\d{6}\b/g,

  // Financial
  paymentCard: /\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{13,19}\b/g,
  upiId: /\b[a-zA-Z0-9.\-_]{2,256}@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|axl|ibl|gpay|apl|upi)\b/gi,
  ifsc: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,

  // Secrets & API Keys
  awsKey: /\b(AKIA[0-9A-Z]{16})\b/g,
  googleApiKey: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
  openaiKey: /\bsk-(?:proj-)?[a-zA-Z0-9\-_]{20,80}\b/g,
  githubToken: /\b(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36,255}\b/g,
  jwt: /\beyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*\b/g,
  privateKey: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]+?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  genericSecret: /(?:password|passwd|pwd|secret|api_key|access_token|auth_token)\s*[:=]\s*["']?([^\s"';,]+)["']?/gi,

  // Scam / Phishing Indicators
  shortenedUrl: /https?:\/\/(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy|goo\.gl|ow\.ly|qr\.ae|v\.gd)\/[^\s]+/gi,
  ipUrl: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?(?:[^\s]*)/gi,
  suspiciousDomain: /https?:\/\/[^\s]*(?:kyc|update-bank|reward-claim|lottery|apk|verify-account|pan-link)[^\s]*/gi,
  scamKeywords: /\b(?:congratulations you won|lottery prize|claim reward|urgent kyc update|account blocked|electricity bill overdue|click here to claim|send otp|enter upi pin to receive|part-time job daily earnings|work from home earn \d+)\b/gi,

  // Policy risks
  policySharing: /\b(?:third parties|third party|affiliates|advertising partners|advertising data brokers|data brokers|share your personal information|share your personal data|sell your personal data|monetize user information)\b/gi,
  policyRetention: /\b(?:indefinitely|as long as necessary|perpetual|no obligation to delete|retain your data forever|retain user data forever|retain.*forever)\b/gi,

  // AI Trust / Hallucination indicators
  inventedCitations: /\[\d+\]|\b(?:as proven by study [A-Z0-9\-]+|according to guaranteed research|100% verified by Dr\.\s+[A-Z][a-z]+)\b/gi,
  promptInjection: /\b(?:ignore previous instructions|system override|jailbreak|DAN mode|forget your safety guidelines)\b/gi
};

export function maskSensitiveValue(type, val) {
  if (!val) return '[REDACTED]';
  const clean = val.trim();

  switch (type) {
    case 'aadhaar': {
      const digits = clean.replace(/\D/g, '');
      const last4 = digits.slice(-4) || '1234';
      return `XXXX-XXXX-${last4}`;
    }
    case 'paymentCard': {
      const digits = clean.replace(/\D/g, '');
      const last4 = digits.slice(-4) || '1234';
      return `XXXX-XXXX-XXXX-${last4}`;
    }
    case 'phone': {
      const digits = clean.replace(/\D/g, '');
      const last4 = digits.slice(-4) || '1234';
      return `******${last4}`;
    }
    case 'email': {
      const parts = clean.split('@');
      if (parts.length === 2) {
        const username = parts[0];
        const firstLetter = username.charAt(0) || 'u';
        return `${firstLetter}***@${parts[1]}`;
      }
      return '***@***.***';
    }
    case 'pan': {
      const last2 = clean.slice(-2);
      return `XXXXX***${last2}`;
    }
    case 'passport': {
      return `${clean.charAt(0)}******${clean.slice(-1)}`;
    }
    case 'shortenedUrl':
    case 'ipUrl':
    case 'suspiciousDomain': {
      return '[SUSPICIOUS-LINK-REDACTED]';
    }
    case 'awsKey':
    case 'googleApiKey':
    case 'openaiKey':
    case 'githubToken':
    case 'jwt':
    case 'privateKey':
    case 'genericSecret':
    default:
      return '[REDACTED]';
  }
}
