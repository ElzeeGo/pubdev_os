-- Script to manually process pending credit purchases
-- Run this in Supabase SQL Editor to add credits for purchases that weren't processed

-- First, let's see what pending purchases exist
SELECT 
  id,
  organization_id,
  amount_usd,
  payment_id,
  status,
  created_at
FROM credit_purchases
WHERE status = 'pending'
ORDER BY created_at DESC;

-- To manually add credits for a specific purchase, use:
-- Replace 'purchase_id_here' and 'org_id_here' and amount with actual values

-- Example (uncomment and replace values):
-- SELECT add_credits(
--   'org_id_here',        -- organization_id from the purchase
--   10.00,                 -- amount_usd from the purchase  
--   'purchase_id_here'    -- id from the purchase
-- );

-- Or process ALL pending purchases at once (BE CAREFUL - only run once!):
-- DO $$
-- DECLARE
--   purchase RECORD;
-- BEGIN
--   FOR purchase IN 
--     SELECT id, organization_id, amount_usd 
--     FROM credit_purchases 
--     WHERE status = 'pending'
--   LOOP
--     PERFORM add_credits(
--       purchase.organization_id,
--       purchase.amount_usd,
--       purchase.id
--     );
--     RAISE NOTICE 'Processed purchase % for org % - added $%', 
--       purchase.id, purchase.organization_id, purchase.amount_usd;
--   END LOOP;
-- END $$;

-- After processing, verify the credit balance was updated:
-- SELECT * FROM credit_balances WHERE organization_id = 'your_org_id_here';

