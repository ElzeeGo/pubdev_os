-- Create OAuth state table for temporary storage during OAuth flow
CREATE TABLE IF NOT EXISTS public.oauth_state (
  id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_oauth_state_expires_at ON public.oauth_state(expires_at);

-- Enable RLS
ALTER TABLE public.oauth_state ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow anonymous access (since user isn't authenticated during OAuth flow)
CREATE POLICY "Allow insert during OAuth flow" ON public.oauth_state
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select during OAuth flow" ON public.oauth_state
  FOR SELECT
  USING (true);

CREATE POLICY "Allow delete during OAuth flow" ON public.oauth_state
  FOR DELETE
  USING (true);

-- Function to clean up expired OAuth states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM public.oauth_state
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: You can set up a cron job in Supabase to run this cleanup function periodically
-- Or call it manually from your application

