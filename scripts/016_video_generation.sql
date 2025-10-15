-- Migration: Add video generation support
-- Created: 2025-10-14
-- Description: Adds Sora 2 video generation capabilities to the platform

-- 1. Add videos column to drafts table
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT NULL;

COMMENT ON COLUMN drafts.videos IS 'Array of generated video assets with metadata (id, prompt, url, status, model, duration, size, timestamps)';

-- 2. Add videos_generated tracking to generation_logs
ALTER TABLE generation_logs ADD COLUMN IF NOT EXISTS videos_generated INTEGER DEFAULT 0;
ALTER TABLE generation_logs ADD COLUMN IF NOT EXISTS video_seconds INTEGER DEFAULT 0;

COMMENT ON COLUMN generation_logs.videos_generated IS 'Number of videos generated in this generation';
COMMENT ON COLUMN generation_logs.video_seconds IS 'Total seconds of video generated';

-- 2b. Update the type CHECK constraint to include 'video'
ALTER TABLE generation_logs DROP CONSTRAINT IF EXISTS generation_logs_type_check;
ALTER TABLE generation_logs ADD CONSTRAINT generation_logs_type_check 
  CHECK (type IN ('text', 'image', 'video', 'both'));

-- 3. Update pricing_config to support video pricing
ALTER TABLE pricing_config ADD COLUMN IF NOT EXISTS price_per_video_second DECIMAL(10, 6) DEFAULT 0;
ALTER TABLE pricing_config ADD COLUMN IF NOT EXISTS price_per_video_base DECIMAL(10, 6) DEFAULT 0;

COMMENT ON COLUMN pricing_config.price_per_video_second IS 'Cost per second of video generation';
COMMENT ON COLUMN pricing_config.price_per_video_base IS 'Base cost per video regardless of length';

-- 4. Insert Sora 2 pricing configuration
-- NOTE: These are estimated costs. Update with actual OpenAI pricing when available.
-- Sora 2: ~$0.10-0.15/second (using $0.12 average)
-- Sora 2 Pro: ~$0.20-0.30/second (using $0.25 average)
INSERT INTO pricing_config (
  model, 
  provider, 
  price_per_video_second,
  price_per_video_base,
  price_per_million_prompt_tokens,
  price_per_million_completion_tokens,
  price_per_image,
  active
) VALUES
  ('sora-2', 'openai', 0.12, 0.00, 0, 0, 0, true),
  ('sora-2-pro', 'openai', 0.25, 0.00, 0, 0, 0, true)
ON CONFLICT (model) DO UPDATE SET
  price_per_video_second = EXCLUDED.price_per_video_second,
  price_per_video_base = EXCLUDED.price_per_video_base,
  active = EXCLUDED.active,
  updated_at = NOW();

-- 5. Create function to calculate video generation cost
CREATE OR REPLACE FUNCTION calculate_video_generation_cost(
  p_model TEXT,
  p_video_count INTEGER,
  p_video_seconds INTEGER DEFAULT 5
)
RETURNS DECIMAL(10, 6) AS $$
DECLARE
  v_price_per_second DECIMAL(10, 6);
  v_price_base DECIMAL(10, 6);
  v_total_cost DECIMAL(10, 6);
BEGIN
  -- Get pricing for the video model
  SELECT 
    price_per_video_second,
    price_per_video_base
  INTO v_price_per_second, v_price_base
  FROM pricing_config
  WHERE model = p_model AND active = true
  LIMIT 1;
  
  -- If model not found, return 0
  IF v_price_per_second IS NULL THEN
    RETURN 0.00;
  END IF;
  
  -- Calculate cost: (base cost + cost per second * seconds) * video count
  v_total_cost := (
    COALESCE(v_price_base, 0.00) + 
    (v_price_per_second * p_video_seconds::DECIMAL)
  ) * p_video_count::DECIMAL;
  
  RETURN ROUND(v_total_cost, 6);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_video_generation_cost IS 'Calculates the cost for video generation based on model, count, and duration';

-- 6. Update credit_balances to track video generations
ALTER TABLE credit_balances ADD COLUMN IF NOT EXISTS total_videos INTEGER DEFAULT 0;

COMMENT ON COLUMN credit_balances.total_videos IS 'Total number of videos generated (all-time)';

-- 7. Create index for video-related queries
CREATE INDEX IF NOT EXISTS idx_generation_logs_videos ON generation_logs(videos_generated) WHERE videos_generated > 0;
CREATE INDEX IF NOT EXISTS idx_drafts_videos ON drafts((videos IS NOT NULL)) WHERE videos IS NOT NULL;

-- 8. Test the video cost calculation function
DO $$
DECLARE
  v_test_cost_sora2 DECIMAL(10, 6);
  v_test_cost_sora2pro DECIMAL(10, 6);
BEGIN
  -- Test Sora 2: 1 video, 5 seconds = $0.60
  SELECT calculate_video_generation_cost('sora-2', 1, 5) INTO v_test_cost_sora2;
  RAISE NOTICE 'Sora 2 (5 sec): $%', v_test_cost_sora2;
  
  -- Test Sora 2 Pro: 1 video, 10 seconds = $2.50
  SELECT calculate_video_generation_cost('sora-2-pro', 1, 10) INTO v_test_cost_sora2pro;
  RAISE NOTICE 'Sora 2 Pro (10 sec): $%', v_test_cost_sora2pro;
END $$;

-- 9. Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_video_generation_cost TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_video_generation_cost TO service_role;

-- Migration complete
COMMENT ON TABLE drafts IS 'Updated: Added videos column for Sora 2 video generation';
COMMENT ON TABLE generation_logs IS 'Updated: Added videos_generated and video_seconds for video tracking';
COMMENT ON TABLE pricing_config IS 'Updated: Added video pricing columns';

