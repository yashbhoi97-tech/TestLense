-- ==========================================================
-- TRUSTLENSE SUPABASE POSTGRESQL SCHEMA
-- Execute this SQL in Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ==========================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

-- 2. SCANS TABLE (Zero raw input stored - only redacted text & masked findings)
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    mode TEXT NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    verdict TEXT NOT NULL,
    summary TEXT NOT NULL,
    findings JSONB DEFAULT '[]'::jsonb,
    redacted_text TEXT DEFAULT '',
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    extras JSONB DEFAULT '{}'::jsonb,
    ai_unavailable BOOLEAN DEFAULT FALSE,
    input_length INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for filtering and ordering scans
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans (user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_mode ON scans (mode);
CREATE INDEX IF NOT EXISTS idx_scans_risk_level ON scans (risk_level);

-- 3. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    mode TEXT,
    ip TEXT DEFAULT '127.0.0.1',
    user_agent TEXT DEFAULT 'Unknown',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- 4. TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    chat_transcript JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets (LOWER(email));
