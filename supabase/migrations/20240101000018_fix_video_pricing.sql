-- Fix video pricing to reflect actual OpenAI Sora pricing with 2.5x markup
-- OpenAI Pricing:
--   sora-2: $0.10/second → 2.5x = $0.25/second
--   sora-2-pro (Portrait/Landscape): $0.30/second → 2.5x = $0.75/second
--   sora-2-pro (Wide/Tall): $0.50/second → 2.5x = $1.25/second

-- Update existing sora-2 pricing
UPDATE pricing_config 
SET price_per_video_second = 0.25,
    updated_at = NOW()
WHERE model = 'sora-2';

-- Update sora-2-pro to base price (standard sizes)
UPDATE pricing_config 
SET price_per_video_second = 0.75,
    updated_at = NOW()
WHERE model = 'sora-2-pro';

-- Add additional pricing entries for wide/tall formats
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
  ('sora-2-pro-wide', 'openai', 1.25, 0.00, 0, 0, 0, true)
ON CONFLICT (model) DO UPDATE SET
  price_per_video_second = EXCLUDED.price_per_video_second,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Update the calculate_video_generation_cost function to handle different sizes
CREATE OR REPLACE FUNCTION calculate_video_generation_cost(
  p_model TEXT,
  p_video_count INTEGER,
  p_video_seconds INTEGER DEFAULT 0
) RETURNS NUMERIC AS $$
DECLARE
  v_config pricing_config;
  v_base_cost NUMERIC := 0;
  v_duration_cost NUMERIC := 0;
  v_total_cost NUMERIC;
BEGIN
  -- For now, we use the base model pricing
  -- In the future, we can extend this to accept video size parameter
  SELECT * INTO v_config
  FROM pricing_config
  WHERE model = p_model AND active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE WARNING 'No pricing config found for model: %', p_model;
    RETURN 0;
  END IF;

  -- Calculate costs
  v_base_cost := COALESCE(v_config.price_per_video_base, 0) * p_video_count;
  v_duration_cost := COALESCE(v_config.price_per_video_second, 0) * p_video_seconds;
  v_total_cost := v_base_cost + v_duration_cost;

  RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;

-- Add a size-aware version for future use
CREATE OR REPLACE FUNCTION calculate_video_generation_cost_with_size(
  p_model TEXT,
  p_video_count INTEGER,
  p_video_seconds INTEGER,
  p_video_size TEXT DEFAULT '1280x720'
) RETURNS NUMERIC AS $$
DECLARE
  v_effective_model TEXT := p_model;
  v_config pricing_config;
  v_base_cost NUMERIC := 0;
  v_duration_cost NUMERIC := 0;
  v_total_cost NUMERIC;
BEGIN
  -- Adjust model name based on video size for sora-2-pro
  IF p_model = 'sora-2-pro' AND p_video_size IN ('1792x1024', '1024x1792') THEN
    v_effective_model := 'sora-2-pro-wide';
  END IF;

  -- Get pricing config
  SELECT * INTO v_config
  FROM pricing_config
  WHERE model = v_effective_model AND active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE WARNING 'No pricing config found for model: % (effective: %)', p_model, v_effective_model;
    RETURN 0;
  END IF;

  -- Calculate costs
  v_base_cost := COALESCE(v_config.price_per_video_base, 0) * p_video_count;
  v_duration_cost := COALESCE(v_config.price_per_video_second, 0) * p_video_seconds;
  v_total_cost := v_base_cost + v_duration_cost;

  RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;

-- Show updated pricing
SELECT 
  model,
  price_per_video_second,
  price_per_video_second * 8 AS cost_per_8_seconds,
  active
FROM pricing_config
WHERE model LIKE 'sora-%'
ORDER BY model;

