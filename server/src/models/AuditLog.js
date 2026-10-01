import { getSupabase } from '../config/supabase.js';

export const AuditLog = {
  async create(logData) {
    const supabase = getSupabase();
    const payload = {
      user_id: logData.userId,
      action: logData.action,
      mode: logData.mode || null,
      ip: logData.ip || '127.0.0.1',
      user_agent: logData.userAgent || 'Unknown',
      created_at: logData.createdAt ? new Date(logData.createdAt).toISOString() : new Date().toISOString()
    };

    const { data, error } = await supabase.from('audit_logs').insert(payload);
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    return this._format(row);
  },

  async insertMany(logsList) {
    const supabase = getSupabase();
    const payloads = logsList.map((l) => ({
      user_id: l.userId,
      action: l.action,
      mode: l.mode || null,
      ip: l.ip || '127.0.0.1',
      user_agent: l.userAgent || 'Unknown',
      created_at: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString()
    }));

    const { data, error } = await supabase.from('audit_logs').insert(payloads);
    if (error) throw new Error(error.message);
    const rows = Array.isArray(data) ? data : [data];
    return rows.map((r) => this._format(r));
  },

  async find(filter = {}, options = {}) {
    const supabase = getSupabase();
    let query = supabase.from('audit_logs').select('*');

    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }

    query = query.order('created_at', { ascending: false });

    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map((r) => this._format(r));
  },

  async deleteMany(filter = {}) {
    const supabase = getSupabase();
    let query = supabase.from('audit_logs').delete();
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
      action: row.action,
      mode: row.mode,
      ip: row.ip,
      userAgent: row.user_agent,
      createdAt: row.created_at
    };
  }
};
