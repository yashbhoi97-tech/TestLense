import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

let supabaseClient = null;
let isInMemoryFallback = false;

// In-memory development store used ONLY when SUPABASE_URL is not set in development
const inMemoryDB = {
  users: [],
  scans: [],
  audit_logs: [],
  tickets: []
};

class InMemoryQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.orders = [];
    this.limitCount = null;
    this.offsetCount = 0;
    this.isSingle = false;
    this.countMode = null;
    this.selectedFields = '*';
    this.isDelete = false;
  }

  select(fields = '*', options = {}) {
    this.selectedFields = fields;
    if (options.count) {
      this.countMode = options.count;
    }
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  eq(column, value) {
    this.filters.push((row) => {
      if (column === 'id' || column === 'user_id') {
        return String(row[column]) === String(value);
      }
      if (typeof row[column] === 'string' && typeof value === 'string') {
        return row[column].toLowerCase() === value.toLowerCase();
      }
      return row[column] === value;
    });
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orders.push({ column, ascending });
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  range(from, to) {
    this.offsetCount = from;
    this.limitCount = to - from + 1;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async insert(values) {
    const list = Array.isArray(values) ? values : [values];
    const inserted = list.map((item) => {
      const record = {
        id: item.id || crypto.randomUUID(),
        created_at: item.created_at || new Date().toISOString(),
        ...item
      };
      inMemoryDB[this.table].push(record);
      return record;
    });

    return {
      data: this.isSingle || !Array.isArray(values) ? inserted[0] : inserted,
      error: null
    };
  }

  then(resolve, reject) {
    try {
      if (this.isDelete) {
        let rows = inMemoryDB[this.table] || [];
        const originalLength = rows.length;
        const remaining = rows.filter((row) => !this.filters.every((f) => f(row)));
        inMemoryDB[this.table] = remaining;

        resolve({
          data: null,
          error: null,
          count: originalLength - remaining.length
        });
        return;
      }

      let rows = [...(inMemoryDB[this.table] || [])];

      // Apply filters
      for (const f of this.filters) {
        rows = rows.filter(f);
      }

      const totalCount = rows.length;

      // Apply ordering
      for (const { column, ascending } of this.orders) {
        rows.sort((a, b) => {
          let valA = a[column];
          let valB = b[column];
          if (valA instanceof Date) valA = valA.getTime();
          if (valB instanceof Date) valB = valB.getTime();
          if (typeof valA === 'string' && typeof valB === 'string') {
            return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        });
      }

      // Apply offset & limit
      if (this.offsetCount > 0) {
        rows = rows.slice(this.offsetCount);
      }
      if (this.limitCount !== null) {
        rows = rows.slice(0, this.limitCount);
      }

      if (this.isSingle) {
        const data = rows[0] || null;
        resolve({ data, error: null, count: totalCount });
      } else {
        resolve({ data: rows, error: null, count: totalCount });
      }
    } catch (err) {
      reject(err);
    }
  }
}

class InMemorySupabaseClient {
  from(table) {
    if (!inMemoryDB[table]) {
      inMemoryDB[table] = [];
    }
    return new InMemoryQueryBuilder(table);
  }
}

export function initSupabase(options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test' || options.forceFallback;

  if (isTest || !url || !key) {
    if (isProd && !options.forceFallback) {
      console.error('FATAL: SUPABASE_URL and SUPABASE_SECRET_KEY are required in production environment.');
      process.exit(1);
    }

    console.log('[Supabase] Initializing in-memory Supabase adapter (isolated test/dev mode)...');
    supabaseClient = new InMemorySupabaseClient();
    isInMemoryFallback = true;
    return supabaseClient;
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isInMemoryFallback = false;
    console.log(`[Supabase] Initialized client connected to ${url}`);
    return supabaseClient;
  } catch (err) {
    console.error(`[Supabase] Initialization error: ${err.message}`);
    throw err;
  }
}

export function getSupabase() {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

export function isUsingFallback() {
  return isInMemoryFallback;
}

export function resetInMemoryStore() {
  inMemoryDB.users = [];
  inMemoryDB.scans = [];
  inMemoryDB.audit_logs = [];
  inMemoryDB.tickets = [];
}
