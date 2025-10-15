-- API Keys table for authenticating package users
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Security
  key_hash TEXT NOT NULL UNIQUE, -- Hashed API key
  key_preview TEXT NOT NULL, -- Last 4 characters for display
  
  -- Metadata
  name TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Indexes
  CONSTRAINT api_keys_name_check CHECK (char_length(name) > 0)
);

-- Scans table to store automated scan submissions
CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  api_key_id TEXT REFERENCES api_keys(id) ON DELETE SET NULL,
  
  -- Scan data
  commit_sha TEXT NOT NULL,
  commit_message TEXT,
  commit_author TEXT,
  commit_timestamp TIMESTAMPTZ,
  
  changes JSONB NOT NULL DEFAULT '{"added":[],"modified":[],"deleted":[]}',
  features JSONB NOT NULL DEFAULT '[]',
  
  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  -- Indexes for performance
  CONSTRAINT scans_commit_sha_check CHECK (char_length(commit_sha) > 0)
);

-- Link drafts to scans (add scan_id to existing drafts table)
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS scan_id TEXT REFERENCES scans(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_project_id ON api_keys(project_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_last_used_at ON api_keys(last_used_at);

CREATE INDEX IF NOT EXISTS idx_scans_project_id ON scans(project_id);
CREATE INDEX IF NOT EXISTS idx_scans_api_key_id ON scans(api_key_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_commit_sha ON scans(commit_sha);

CREATE INDEX IF NOT EXISTS idx_drafts_scan_id ON drafts(scan_id);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view their own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create API keys for their organizations"
  ON api_keys FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()::text
      AND memberships.organization_id = api_keys.organization_id
      AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete their own API keys"
  ON api_keys FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()::text
      AND memberships.organization_id = api_keys.organization_id
      AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can update their own API keys"
  ON api_keys FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()::text
      AND memberships.organization_id = api_keys.organization_id
      AND memberships.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for scans
CREATE POLICY "Users can view scans for their projects"
  ON scans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN memberships ON projects.organization_id = memberships.organization_id
      WHERE projects.id = scans.project_id
      AND memberships.user_id = auth.uid()::text
    )
  );

-- Note: Scans are inserted via API endpoint with API key authentication, not through RLS
-- We'll handle INSERT permission in the API endpoint directly

CREATE POLICY "Service role can insert scans"
  ON scans FOR INSERT
  WITH CHECK (true); -- API endpoint will validate API key

-- Function to update last_used_at on API key
CREATE OR REPLACE FUNCTION update_api_key_last_used()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE api_keys
  SET last_used_at = NOW()
  WHERE id = NEW.api_key_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_used_at when scan is created
CREATE TRIGGER update_api_key_last_used_trigger
  AFTER INSERT ON scans
  FOR EACH ROW
  WHEN (NEW.api_key_id IS NOT NULL)
  EXECUTE FUNCTION update_api_key_last_used();

-- Add comment
COMMENT ON TABLE api_keys IS 'API keys for authenticating pubdev package installations';
COMMENT ON TABLE scans IS 'Automated scans submitted by pubdev package from user codebases';

