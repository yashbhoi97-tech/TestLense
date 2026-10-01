import { PATTERNS, maskSensitiveValue } from './patterns.js';
import { validateLuhn, validatePAN, validateIFSC } from './validators.js';

export function runDeterministicDetection(text, mode = 'leak-guard') {
  if (!text || typeof text !== 'string') {
    return {
      riskScore: 0,
      riskLevel: 'low',
      verdict: 'No content provided',
      summary: 'Empty text passed to scanner.',
      findings: [],
      recommendedActions: ['Provide text content to initiate analysis.']
    };
  }

  const findings = [];
  let score = 0;

  // Helper to test regex and extract matches
  function findMatches(pattern, type, severity, category, descriptionTemplate, validator = null) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const matchVal = match[0];
      const matchStart = match.index;
      const matchEnd = match.index + matchVal.length;

      if (validator && !validator(matchVal)) {
        continue;
      }

      const maskedPreview = maskSensitiveValue(type, matchVal);
      findings.push({
        type,
        severity,
        category,
        description: descriptionTemplate(maskedPreview),
        maskedPreview,
        start: matchStart,
        end: matchEnd
      });

      // Accumulate risk
      if (severity === 'critical') score += 35;
      else if (severity === 'high') score += 25;
      else if (severity === 'medium') score += 15;
      else score += 5;
    }
  }

  // 1. Secrets & Private Keys (Always critical in any mode)
  findMatches(PATTERNS.privateKey, 'privateKey', 'critical', 'credentials', () => 'Unencrypted Private Key block detected');
  findMatches(PATTERNS.awsKey, 'awsKey', 'critical', 'credentials', () => 'AWS Access Key ID exposed');
  findMatches(PATTERNS.googleApiKey, 'googleApiKey', 'critical', 'credentials', () => 'Google Cloud/AIza API key exposed');
  findMatches(PATTERNS.openaiKey, 'openaiKey', 'critical', 'credentials', () => 'OpenAI Secret API key exposed');
  findMatches(PATTERNS.githubToken, 'githubToken', 'critical', 'credentials', () => 'GitHub Personal Access Token exposed');
  findMatches(PATTERNS.jwt, 'jwt', 'high', 'credentials', () => 'JSON Web Token (JWT) session credential found');
  findMatches(PATTERNS.genericSecret, 'genericSecret', 'high', 'credentials', () => 'Hardcoded password, token, or secret variable exposed');

  // 2. Financial & PII
  findMatches(PATTERNS.paymentCard, 'paymentCard', 'critical', 'financial', (m) => `Payment Card number detected (${m})`, (val) => validateLuhn(val));
  findMatches(PATTERNS.aadhaar, 'aadhaar', 'high', 'identity', (m) => `Indian Aadhaar Number detected (${m})`);
  findMatches(PATTERNS.pan, 'pan', 'high', 'identity', (m) => `Permanent Account Number (PAN) detected (${m})`, (val) => validatePAN(val));
  findMatches(PATTERNS.phone, 'phone', 'medium', 'contact', (m) => `Phone number detected (${m})`);
  findMatches(PATTERNS.email, 'email', 'low', 'contact', (m) => `Email address detected (${m})`);
  findMatches(PATTERNS.upiId, 'upiId', 'medium', 'financial', (m) => `UPI ID address detected (${m})`);
  findMatches(PATTERNS.ifsc, 'ifsc', 'medium', 'financial', (m) => `Bank IFSC code detected (${m})`, (val) => validateIFSC(val));
  findMatches(PATTERNS.passport, 'passport', 'high', 'identity', (m) => `Passport number pattern detected (${m})`);

  // 3. Phishing / Short links / Malicious URLs
  findMatches(PATTERNS.shortenedUrl, 'shortenedUrl', 'high', 'phishing', () => 'Obfuscated / Shortened URL detected hiding destination');
  findMatches(PATTERNS.ipUrl, 'ipUrl', 'critical', 'phishing', () => 'Direct IP address URL detected (frequently used in malware/phishing)');
  findMatches(PATTERNS.suspiciousDomain, 'suspiciousDomain', 'high', 'phishing', () => 'Suspicious domain name targeting banking/KYC verification');
  findMatches(PATTERNS.scamKeywords, 'scamKeywords', 'high', 'social-engineering', (m) => `High-risk social engineering scam phrasing: "${m}"`);

  // 4. Mode-specific detections
  if (mode === 'scam-analyzer') {
    // UPI PIN Trap check
    if (/pin\s*(?:to|for)\s*(?:receive|claim|accept|credit)/i.test(text) || /enter\s*(?:your\s*)?upi\s*pin/i.test(text)) {
      findings.push({
        type: 'upiPinTrap',
        severity: 'critical',
        category: 'fraud',
        description: 'UPI PIN Trap detected: UPI PIN is ONLY required to SEND money, never to receive money.',
        maskedPreview: 'ENTER UPI PIN TO RECEIVE MONEY',
        start: 0,
        end: Math.min(text.length, 50)
      });
      score += 40;
    }
    // Urgency & Threat Triggers
    if (/within (?:24|12|2|1) hours?|immediately|account will be blocked|sim deactivated/i.test(text)) {
      findings.push({
        type: 'coerciveUrgency',
        severity: 'high',
        category: 'social-engineering',
        description: 'Artificial urgency and fear tactics detected to force rushed actions.',
        maskedPreview: '[COERCIVE-URGENCY-DETECTED]',
        start: 0,
        end: Math.min(text.length, 40)
      });
      score += 25;
    }
  }

  if (mode === 'policy-decoder') {
    findMatches(PATTERNS.policySharing, 'policySharing', 'medium', 'privacy-risk', (m) => `Data sharing clause detected: "${m}"`);
    findMatches(PATTERNS.policyRetention, 'policyRetention', 'high', 'privacy-risk', (m) => `Indefinite data retention clause: "${m}"`);
    if (/we reserve the right to modify.*without.*notice/i.test(text)) {
      findings.push({
        type: 'unilateralTermsChange',
        severity: 'high',
        category: 'terms-risk',
        description: 'Unilateral policy modifications without prior notification permitted.',
        maskedPreview: 'UNILATERAL-CHANGES-CLAUSE',
        start: 0,
        end: Math.min(text.length, 40)
      });
      score += 20;
    }
  }

  if (mode === 'trust-auditor') {
    findMatches(PATTERNS.promptInjection, 'promptInjection', 'critical', 'ai-safety', () => 'Prompt Injection / Jailbreak trigger sequence detected');
    findMatches(PATTERNS.inventedCitations, 'inventedCitations', 'medium', 'hallucination', () => 'Potentially unverifiable citation or authority claim marker');
    if (/100% guaranteed|scientifically proven beyond doubt without exception/i.test(text)) {
      findings.push({
        type: 'overconfidenceBias',
        severity: 'medium',
        category: 'hallucination',
        description: 'Absolute certainty language on complex/unverified topic indicates potential AI hallucination.',
        maskedPreview: 'ABSOLUTE-CERTAINTY-CLAIM',
        start: 0,
        end: Math.min(text.length, 40)
      });
      score += 15;
    }
  }

  // Deduplicate overlapping findings
  const uniqueFindings = [];
  const seenTypes = new Set();
  for (const f of findings) {
    const key = `${f.type}-${f.start}-${f.end}-${f.maskedPreview}`;
    if (!seenTypes.has(key)) {
      seenTypes.add(key);
      uniqueFindings.push(f);
    }
  }

  // Clamp score
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine risk level
  let riskLevel = 'low';
  if (finalScore >= 75) riskLevel = 'critical';
  else if (finalScore >= 50) riskLevel = 'high';
  else if (finalScore >= 25) riskLevel = 'medium';

  // Build verdict, summary and recommendations based on mode and findings
  const { verdict, summary, recommendedActions } = generateRuleVerdict(mode, finalScore, riskLevel, uniqueFindings);

  return {
    riskScore: finalScore,
    riskLevel,
    verdict,
    summary,
    findings: uniqueFindings,
    recommendedActions
  };
}

function generateRuleVerdict(mode, score, riskLevel, findings) {
  let verdict = 'Safe & Clean';
  let summary = 'No high-risk security threats or unprotected sensitive indicators were found.';
  const actions = [];

  if (mode === 'leak-guard') {
    if (findings.length > 0) {
      verdict = `${findings.length} Sensitive Data Exposure${findings.length > 1 ? 's' : ''} Identified`;
      summary = `Identified sensitive PII or credentials (${findings.map(f => f.type).slice(0, 3).join(', ')}). Use the sanitized redacted version before sharing.`;
      actions.push('Copy the redacted safe text below instead of sharing raw content.');
      actions.push('Revoke and regenerate any exposed API keys, passwords, or tokens immediately.');
      actions.push('Never paste personal Aadhaar, PAN, or card numbers into untrusted systems.');
    } else {
      actions.push('Content appears clear of standard sensitive credentials and PII patterns.');
    }
  } else if (mode === 'scam-analyzer') {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      verdict = 'High Likelihood of Fraudulent Scam / Phishing';
      summary = 'This message contains prominent red flags such as urgent threats, payment PIN traps, or suspicious unverified links.';
      actions.push('DO NOT enter your UPI PIN — remember UPI PIN is only needed to transfer out money.');
      actions.push('DO NOT click shortened or unfamiliar links.');
      actions.push('Block and report this sender in your messaging app / telecom portal (Chakshu / 1930).');
    } else if (riskLevel === 'medium') {
      verdict = 'Moderate Risk — Exercise Caution';
      summary = 'Contains suspicious phrasing or unverified contact information.';
      actions.push('Verify the communication directly through the official bank/company website or app.');
      actions.push('Do not share OTPs, personal documents, or sensitive details.');
    } else {
      verdict = 'Low Suspicion Indicator';
      summary = 'No common fraud keywords, PIN traps, or malicious URLs detected.';
      actions.push('Always confirm the official sender ID before acting on financial requests.');
    }
  } else if (mode === 'policy-decoder') {
    if (score > 40) {
      verdict = 'Privacy Risks & Third-Party Sharing Identified';
      summary = 'The policy allows significant data collection, sharing with advertising partners, or prolonged data retention.';
      actions.push('Opt out of non-essential data collection and third-party advertising cookies.');
      actions.push('Review account settings to disable location and personalized advertising tracking.');
      actions.push('Request account data deletion if you no longer use this service.');
    } else {
      verdict = 'Standard Privacy Policy Terms';
      summary = 'The policy outlines typical service operations without egregious third-party monetization clauses.';
      actions.push('Periodically review privacy settings to ensure minimal data exposure.');
    }
  } else { // trust-auditor
    if (score > 40) {
      verdict = 'Unverified Claims or AI Safety Concerns';
      summary = 'The text exhibits signs of hallucination, absolute overconfidence, or prompt manipulation.';
      actions.push('Independently fact-check citations and factual assertions with primary sources.');
      actions.push('Do not rely on this output for medical, legal, or high-stakes financial decisions.');
    } else {
      verdict = 'Trustworthy AI Output Baseline';
      summary = 'No evident prompt injection, hallucination markers, or leaked secrets found.';
      actions.push('Verify critical specifics if applying this information to mission-critical tasks.');
    }
  }

  return { verdict, summary, recommendedActions: actions };
}
