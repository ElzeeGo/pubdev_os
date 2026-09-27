-- Fix: Update generation_logs type constraint to include 'video'
-- This fixes the error: "new row for relation "generation_logs" violates check constraint "generation_logs_type_check""

-- Drop the old constraint
ALTER TABLE generation_logs DROP CONSTRAINT IF EXISTS generation_logs_type_check;

-- Add the updated constraint that includes 'video'
ALTER TABLE generation_logs ADD CONSTRAINT generation_logs_type_check 
  CHECK (type IN ('text', 'image', 'video', 'both'));

-- Verify the constraint
DO $$
BEGIN
  RAISE NOTICE 'Constraint updated successfully. Valid types are now: text, image, video, both';
END $$;

