import { Scan } from '../models/Scan.js';

export async function getStats(req, res, next) {
  try {
    const query = {};
    if (req.user) {
      query.userId = req.user._id;
    }

    const totalScans = await Scan.countDocuments(query);
    const scans = await Scan.find(query, { limit: 100 });

    if (totalScans === 0) {
      return res.json({
        success: true,
        data: {
          totalScans: 0,
          averageRisk: 0,
          highRiskCount: 0,
          scansByMode: {
            'leak-guard': 0,
            'scam-analyzer': 0,
            'policy-decoder': 0,
            'trust-auditor': 0
          },
          riskDistribution: [
            { level: 'low', count: 0, color: '#10B981' },
            { level: 'medium', count: 0, color: '#F59E0B' },
            { level: 'high', count: 0, color: '#EF4444' },
            { level: 'critical', count: 0, color: '#DC2626' }
          ],
          topThreats: [],
          timeline: [],
          recentScans: []
        }
      });
    }

    // Calculate aggregated statistics
    let totalScore = 0;
    let highRiskCount = 0;
    const modeCounts = {
      'leak-guard': 0,
      'scam-analyzer': 0,
      'policy-decoder': 0,
      'trust-auditor': 0
    };
    const riskLevelCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    const threatCategoryMap = {};
    const dayMap = {};

    for (const scan of scans) {
      totalScore += scan.riskScore;
      if (scan.riskLevel === 'high' || scan.riskLevel === 'critical') {
        highRiskCount++;
      }

      if (modeCounts[scan.mode] !== undefined) {
        modeCounts[scan.mode]++;
      }

      if (riskLevelCounts[scan.riskLevel] !== undefined) {
        riskLevelCounts[scan.riskLevel]++;
      }

      // Threats aggregation
      if (Array.isArray(scan.findings)) {
        for (const f of scan.findings) {
          const typeName = f.type || 'General Finding';
          threatCategoryMap[typeName] = (threatCategoryMap[typeName] || 0) + 1;
        }
      }

      // Timeline aggregation
      const dateKey = new Date(scan.createdAt).toISOString().split('T')[0];
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { date: dateKey, scans: 0, avgRisk: 0, totalScore: 0 };
      }
      dayMap[dateKey].scans++;
      dayMap[dateKey].totalScore += scan.riskScore;
    }

    const averageRisk = Math.round(totalScore / scans.length);

    // Format top threats
    const topThreats = Object.entries(threatCategoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Format timeline (last 14 active days or chronological)
    const timeline = Object.values(dayMap)
      .map(d => ({
        date: d.date.slice(5), // MM-DD
        scans: d.scans,
        avgRisk: Math.round(d.totalScore / d.scans)
      }))
      .slice(-14);

    const riskDistribution = [
      { name: 'Low (0-24)', level: 'low', value: riskLevelCounts.low, color: '#10B981' },
      { name: 'Medium (25-49)', level: 'medium', value: riskLevelCounts.medium, color: '#F59E0B' },
      { name: 'High (50-74)', level: 'high', value: riskLevelCounts.high, color: '#F97316' },
      { name: 'Critical (75-100)', level: 'critical', value: riskLevelCounts.critical, color: '#EF4444' }
    ];

    res.json({
      success: true,
      data: {
        totalScans,
        averageRisk,
        highRiskCount,
        scansByMode: modeCounts,
        riskDistribution,
        topThreats,
        timeline,
        recentScans: scans.slice(0, 10).map(s => ({
          id: s._id,
          mode: s.mode,
          riskScore: s.riskScore,
          riskLevel: s.riskLevel,
          verdict: s.verdict,
          findingsCount: s.findings.length,
          createdAt: s.createdAt
        }))
      }
    });
  } catch (err) {
    next(err);
  }
}
