-- Agidi & Co Law Firm Portal — Supabase Schema
-- Run this in your Supabase dashboard > SQL Editor

-- Users table (staff, clients, admins)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  app_role TEXT NOT NULL DEFAULT 'Client',
  company_name TEXT,
  industry TEXT,
  job_title TEXT,
  client_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  permissions JSONB DEFAULT '[]',
  lawyer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users (app_role);
CREATE INDEX IF NOT EXISTS users_status_idx ON users (status);

-- Invitations table (staff + client invitation workflow)
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Staff',
  status TEXT NOT NULL DEFAULT 'PENDING',
  invited_by TEXT,
  invite_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS invitations_token_idx ON invitations (token);
CREATE INDEX IF NOT EXISTS invitations_status_idx ON invitations (status);
CREATE INDEX IF NOT EXISTS invitations_email_idx ON invitations (email);

-- Documents table (master repository — all files from clients, staff, admin)
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  size TEXT,
  type TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_ADMIN_APPROVAL',
  uploader_role TEXT NOT NULL DEFAULT 'CLIENT',
  storage_path TEXT,
  file_url TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents (user_id);
CREATE INDEX IF NOT EXISTS documents_status_idx ON documents (status);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents (created_at DESC);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  service_title TEXT NOT NULL,
  appointment_date TEXT,
  appointment_time TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_ADMIN_APPROVAL',
  price TEXT,
  tracking_number TEXT,
  consultation_type TEXT,
  practice_area TEXT,
  description TEXT,
  preferred_lawyer TEXT,
  attached_doc_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_user_id_idx ON appointments (user_id);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments (status);

-- Supabase Storage: Create a bucket called "firm-documents"
-- Run in Supabase Dashboard > Storage > New bucket:
--   Name: firm-documents
--   Public: true (or false + use signed URLs)

-- Row Level Security (optional — disable if using service role key only)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow all operations from service role (used by the Express backend)
-- CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
-- CREATE POLICY "Service role full access" ON invitations FOR ALL USING (true);
-- CREATE POLICY "Service role full access" ON documents FOR ALL USING (true);
-- CREATE POLICY "Service role full access" ON appointments FOR ALL USING (true);
