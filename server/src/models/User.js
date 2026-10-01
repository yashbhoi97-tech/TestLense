import { getSupabase } from '../config/supabase.js';

export const User = {
  async create({ name, email, passwordHash }) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      });

    if (error) throw new Error(error.message);
    const user = Array.isArray(data) ? data[0] : data;
    return this._format(user);
  },

  async findByEmail(email) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means 0 rows returned
      console.warn('[User.findByEmail]', error.message);
    }
    if (!data) return null;
    return this._format(data);
  },

  async findById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('[User.findById]', error.message);
    }
    if (!data) return null;
    return this._format(data);
  },

  async deleteMany(filter = {}) {
    const supabase = getSupabase();
    let query = supabase.from('users').delete();
    if (filter.id) query = query.eq('id', filter.id);
    if (filter.email) query = query.eq('email', filter.email);
    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { deletedCount: count || 0 };
  },

  _format(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at
    };
  }
};
