-- Switch billed video models from OpenAI Sora to ElevenLabs.
-- Customer prices include the existing 2.5x markup.
-- Estimates use the model-picker credit costs (MiniMax H3 Max 2,424, Seedance 2.5 4,980)
-- for a 5 second clip, converted at the Pro plan rate of $99 / 600,000 credits.

UPDATE pricing_config
SET active = false,
    updated_at = NOW()
WHERE model IN ('sora-2', 'sora-2-pro', 'sora-2-pro-wide');

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
  ('bytedance-seedance-v2.5', 'elevenlabs', 0.41, 0, 0, 0, 0, true),
  ('minimax-h3-max', 'elevenlabs', 0.20, 0, 0, 0, 0, true)
ON CONFLICT (model) DO UPDATE SET
  provider = EXCLUDED.provider,
  price_per_video_second = EXCLUDED.price_per_video_second,
  active = EXCLUDED.active,
  updated_at = NOW();
