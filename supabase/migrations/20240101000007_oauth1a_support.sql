-- Add OAuth 1.0a support for media uploads (backward compatible)
-- These fields will be NULL for existing users and populated for new connections

ALTER TABLE public.identities 
ADD COLUMN IF NOT EXISTS oauth1a_token TEXT,
ADD COLUMN IF NOT EXISTS oauth1a_secret TEXT;

-- Add index for OAuth 1.0a lookups
CREATE INDEX IF NOT EXISTS idx_identities_oauth1a ON public.identities(user_id, provider) 
WHERE oauth1a_token IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.identities.oauth1a_token IS 'OAuth 1.0a access token for media uploads (Twitter v1.1 API)';
COMMENT ON COLUMN public.identities.oauth1a_secret IS 'OAuth 1.0a access token secret for media uploads';

