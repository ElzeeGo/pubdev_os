-- Add Stripe customer ID to organizations for VAT invoice support
-- This allows proper invoice generation with customer details

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id 
  ON organizations(stripe_customer_id);

-- Add comment
COMMENT ON COLUMN organizations.stripe_customer_id IS 'Stripe customer ID for invoice generation and tax collection';

