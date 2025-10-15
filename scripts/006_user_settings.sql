-- Add settings column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_settings ON public.users USING GIN (settings);

-- Add comment
COMMENT ON COLUMN public.users.settings IS 'User-specific settings including default content generation preferences';

