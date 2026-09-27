-- Add onboarding data fields to users table
-- This captures important user information during onboarding

-- Add onboarding_completed flag
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add onboarding data fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS team_size VARCHAR(50),
ADD COLUMN IF NOT EXISTS how_found_us VARCHAR(100),
ADD COLUMN IF NOT EXISTS primary_use_case TEXT,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(100),
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN users.onboarding_completed IS 'Indicates if user has completed the initial onboarding flow';
COMMENT ON COLUMN users.team_size IS 'Team size category: solo, 2-5, 6-20, 21-50, 51-200, 200+';
COMMENT ON COLUMN users.how_found_us IS 'How the user discovered pubdev: twitter, linkedin, search, friend, blog, etc.';
COMMENT ON COLUMN users.primary_use_case IS 'Primary use case or goal for using pubdev';
COMMENT ON COLUMN users.company_name IS 'Company or organization name';
COMMENT ON COLUMN users.role IS 'User role/title';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when user completed onboarding';

-- Update existing users to have completed onboarding (since they signed up before this feature)
UPDATE users 
SET onboarding_completed = true,
    onboarding_completed_at = created_at
WHERE onboarding_completed IS NULL OR onboarding_completed = false;

-- Create index for faster onboarding status queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed) WHERE onboarding_completed = false;

