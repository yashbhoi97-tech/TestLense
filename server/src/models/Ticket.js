import { getSupabase } from '../config/supabase.js';

export const Ticket = {
  async create(ticketData) {
    const supabase = getSupabase();
    const payload = {
      user_id: ticketData.userId || null,
      email: ticketData.email.toLowerCase().trim(),
      subject: ticketData.subject,
      message: ticketData.message,
      chat_transcript: ticketData.chatTranscript || [],
      status: ticketData.status || 'open',
      created_at: ticketData.createdAt ? new Date(ticketData.createdAt).toISOString() : new Date().toISOString()
    };

    const { data, error } = await supabase.from('tickets').insert(payload);
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    return this._format(row);
  },

  async find(filter = {}) {
    const supabase = getSupabase();
    let query = supabase.from('tickets').select('*');

    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }
    if (filter.email) {
      query = query.eq('email', filter.email.toLowerCase().trim());
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map((r) => this._format(r));
  },

  async deleteMany(filter = {}) {
    const supabase = getSupabase();
    let query = supabase.from('tickets').delete();
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
      email: row.email,
      subject: row.subject,
      message: row.message,
      chatTranscript: Array.isArray(row.chat_transcript) ? row.chat_transcript : [],
      status: row.status,
      createdAt: row.created_at
    };
  }
};
