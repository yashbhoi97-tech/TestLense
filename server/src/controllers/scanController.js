import { z } from 'zod';
import { Scan } from '../models/Scan.js';
import { runDeterministicDetection } from '../services/detection/detector.js';
import { redactText } from '../services/redact.js';
import { analyzeWithGemini } from '../services/gemini.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

const scanRequestSchema = z.object({
  mode: z.enum(['leak-guard', 'scam-analyzer', 'policy-decoder', 'trust-auditor']),
  text: z.string().min(1, 'Text content is required').max(10000, 'Text exceeds maximum length of 10,000 characters')
});

export async function createScan(req, res, next) {
  try {
    const validated = scanRequestSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: validated.error.errors[0]?.message || 'Invalid scan request parameters',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const { mode, text } = validated.data;
    const inputLength = text.length;

    // 1. Run deterministic detection
    const ruleResult = runDeterministicDetection(text, mode);

    // 2. Perform redaction to scrub sensitive text
    const redacted = redactText(text);

    // 3. Attempt AI analysis if enabled
    let aiResult = null;
    let aiUnavailable = true;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        aiResult = await analyzeWithGemini(mode, text, ruleResult);
        if (aiResult) {
          aiUnavailable = false;
        }
      } catch (err) {
        console.warn('[ScanController] AI processing error:', err.message);
      }
    }

    // Combine / synthesize rule results with AI insights if available
    let finalRiskScore = ruleResult.riskScore;
    let finalRiskLevel = ruleResult.riskLevel;
    let finalVerdict = ruleResult.verdict;
    let finalSummary = ruleResult.summary;
    let finalFindings = [...ruleResult.findings];
    let finalActions = [...ruleResult.recommendedActions];
    let finalExtras = {};

    if (aiResult && !aiUnavailable) {
      // Prioritize the higher risk assessment between deterministic rules and AI
      finalRiskScore = Math.max(ruleResult.riskScore, aiResult.riskScore);
      
      if (finalRiskScore >= 75) finalRiskLevel = 'critical';
      else if (finalRiskScore >= 50) finalRiskLevel = 'high';
      else if (finalRiskScore >= 25) finalRiskLevel = 'medium';
      else finalRiskLevel = 'low';

      finalVerdict = aiResult.verdict || ruleResult.verdict;
      finalSummary = aiResult.summary || ruleResult.summary;

      // Merge AI findings avoiding raw exposures
      if (Array.isArray(aiResult.findings)) {
        for (const af of aiResult.findings) {
          finalFindings.push({
            type: af.type || 'ai-finding',
            severity: af.severity || 'medium',
            description: af.description || 'AI contextual finding',
            maskedPreview: af.maskedPreview || '[AI-ANALYZED-ITEM]',
            category: af.category || 'ai-insight'
          });
        }
      }

      if (Array.isArray(aiResult.recommendedActions) && aiResult.recommendedActions.length > 0) {
        finalActions = Array.from(new Set([...finalActions, ...aiResult.recommendedActions]));
      }

      finalExtras = aiResult.extras || {};
    }

    // 4. Persist scan document to MongoDB (NEVER storing raw text!)
    const scanDoc = await Scan.create({
      userId: req.user?._id || null,
      mode,
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel,
      verdict: finalVerdict,
      summary: finalSummary,
      findings: finalFindings,
      redactedText: redacted,
      recommendedActions: finalActions,
      extras: finalExtras,
      aiUnavailable,
      inputLength
    });

    // 5. Audit log if user is logged in
    if (req.user) {
      await logAuditEvent({
        userId: req.user._id,
        action: 'RUN_SCAN',
        mode,
        req
      });
    }

    // 6. Return standard unified response
    res.status(201).json({
      success: true,
      data: {
        id: scanDoc._id,
        mode: scanDoc.mode,
        riskScore: scanDoc.riskScore,
        riskLevel: scanDoc.riskLevel,
        verdict: scanDoc.verdict,
        summary: scanDoc.summary,
        findings: scanDoc.findings,
        redactedText: scanDoc.redactedText,
        recommendedActions: scanDoc.recommendedActions,
        extras: scanDoc.extras,
        aiUnavailable: scanDoc.aiUnavailable,
        createdAt: scanDoc.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getScans(req, res, next) {
  try {
    const { mode, riskLevel, limit = 50, page = 1 } = req.query;
    const query = {};

    if (req.user) {
      query.userId = req.user._id;
    }

    if (mode) query.mode = mode;
    if (riskLevel) query.riskLevel = riskLevel;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Scan.countDocuments(query);
    const scans = await Scan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .select('-__v');

    res.json({
      success: true,
      data: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        scans
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getScanById(req, res, next) {
  try {
    const scan = await Scan.findById(req.params.id).select('-__v');
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Scan not found',
          code: 'SCAN_NOT_FOUND'
        }
      });
    }

    // Check ownership if scan belongs to a specific user
    if (scan.userId && req.user && scan.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied to this scan record',
          code: 'FORBIDDEN'
        }
      });
    }

    res.json({
      success: true,
      data: {
        scan
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteScan(req, res, next) {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Scan not found',
          code: 'SCAN_NOT_FOUND'
        }
      });
    }

    if (scan.userId && (!req.user || scan.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to delete this scan',
          code: 'FORBIDDEN'
        }
      });
    }

    await Scan.findByIdAndDelete(req.params.id);

    if (req.user) {
      await logAuditEvent({
        userId: req.user._id,
        action: 'DELETE_SCAN',
        req
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Scan successfully deleted'
      }
    });
  } catch (err) {
    next(err);
  }
}
