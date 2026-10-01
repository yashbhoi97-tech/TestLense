import { getSupabase } from '../config/supabase.js';

export const Scan = {
  async create(scanData) {
    const supabase = getSupabase();
    const payload = {
      user_id: scanData.userId || null,
      mode: scanData.mode,
      risk_score: scanData.riskScore,
      risk_level: scanData.riskLevel,
      verdict: scanData.verdict,
      summary: scanData.summary,
      findings: scanData.findings || [],
      redacted_text: scanData.redactedText || '',
      recommended_actions: scanData.recommendedActions || [],
      extras: scanData.extras || {},
      ai_unavailable: Boolean(scanData.aiUnavailable),
      input_length: scanData.inputLength,
      created_at: scanData.createdAt ? new Date(scanData.createdAt).toISOString() : new Date().toISOString()
    };

    const { data, error } = await supabase.from('scans').insert(payload);
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    return this._format(row);
  },

  async insertMany(scansList) {
    const supabase = getSupabase();
    const payloads = scansList.map((s) => ({
      user_id: s.userId || null,
      mode: s.mode,
      risk_score: s.riskScore,
      risk_level: s.riskLevel,
      verdict: s.verdict,
      summary: s.summary,
      findings: s.findings || [],
      redacted_text: s.redactedText || '',
      recommended_actions: s.recommendedActions || [],
      extras: s.extras || {},
      ai_unavailable: Boolean(s.aiUnavailable),
      input_length: s.inputLength,
      created_at: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString()
    }));

    const { data, error } = await supabase.from('scans').insert(payloads);
    if (error) throw new Error(error.message);
    const rows = Array.isArray(data) ? data : [data];
    return rows.map((r) => this._format(r));
  },

  async find(filter = {}, options = {}) {
    const supabase = getSupabase();
    let query = supabase.from('scans').select('*');

    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }
    if (filter.mode) {
      query = query.eq('mode', filter.mode);
    }
    if (filter.riskLevel) {
      query = query.eq('risk_level', filter.riskLevel);
    }

    query = query.order('created_at', { ascending: false });

    if (options.skip !== undefined && options.limit !== undefined) {
      query = query.range(options.skip, options.skip + options.limit - 1);
    } else if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map((r) => this._format(r));
  },

  async findById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('[Scan.findById]', error.message);
    }
    if (!data) return null;
    return this._format(data);
  },

  async findByIdAndDelete(id) {
    const supabase = getSupabase();
    const { data, error, count } = await supabase
      .from('scans')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true, count };
  },

  async countDocuments(filter = {}) {
    const supabase = getSupabase();
    let query = supabase.from('scans').select('*', { count: 'exact' });

    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }
    if (filter.mode) {
      query = query.eq('mode', filter.mode);
    }
    if (filter.riskLevel) {
      query = query.eq('risk_level', filter.riskLevel);
    }

    const { count, error } = await query;
    if (error) throw new Error(error.message);
    return count || 0;
  },

  async deleteMany(filter = {}) {
    const supabase = getSupabase();
    let query = supabase.from('scans').delete();
    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }
    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { deletedCount: count || 0 };
  },

  _format(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      userId: row.user_id,
      mode: row.mode,
      riskScore: row.risk_score,
      riskLevel: row.risk_level,
      verdict: row.verdict,
      summary: row.summary,
      findings: Array.isArray(row.findings) ? row.findings : [],
      redactedText: row.redacted_text || '',
      recommendedActions: Array.isArray(row.recommended_actions) ? row.recommended_actions : [],
      extras: row.extras || {},
      aiUnavailable: row.ai_unavailable,
      inputLength: row.input_length,
      createdAt: row.created_at
    };
  }
};
