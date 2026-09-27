-- Fix: Update trigger to track total_videos in credit_balances
-- Issue: The deduct_credits_and_update_stats() function was not incrementing total_videos

CREATE OR REPLACE FUNCTION deduct_credits_and_update_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process completed generations
  IF NEW.status = 'completed' THEN
    -- Deduct cost from balance and update stats
    UPDATE credit_balances
    SET 
      balance_usd = balance_usd - NEW.cost_usd,
      total_spent_usd = total_spent_usd + NEW.cost_usd,
      total_generations = total_generations + 1,
      total_tokens = total_tokens + NEW.total_tokens,
      total_images = total_images + COALESCE(NEW.images_generated, 0),
      total_videos = total_videos + COALESCE(NEW.videos_generated, 0), -- FIX: Added video tracking
      updated_at = NOW()
    WHERE organization_id = NEW.organization_id;
    
    -- Create balance record if it doesn't exist (for new organizations)
    IF NOT FOUND THEN
      INSERT INTO credit_balances (
        organization_id, 
        balance_usd, 
        total_spent_usd,
        total_generations,
        total_tokens,
        total_images,
        total_videos -- FIX: Added video tracking
      )
      VALUES (
        NEW.organization_id, 
        -NEW.cost_usd, -- Negative balance (needs top-up)
        NEW.cost_usd,
        1,
        NEW.total_tokens,
        COALESCE(NEW.images_generated, 0),
        COALESCE(NEW.videos_generated, 0) -- FIX: Added video tracking
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix existing counts for all organizations
UPDATE credit_balances
SET total_videos = (
  SELECT COALESCE(SUM(videos_generated), 0)
  FROM generation_logs
  WHERE generation_logs.organization_id = credit_balances.organization_id
    AND status = 'completed'
);

-- Verify the fix
SELECT 
  organization_id,
  total_videos,
  total_generations,
  total_spent_usd
FROM credit_balances;

