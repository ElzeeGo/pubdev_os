-- Generation logs table for tracking AI usage, costs, and billing
CREATE TABLE IF NOT EXISTS generation_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  
  -- Relations
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  draft_id TEXT REFERENCES drafts(id) ON DELETE SET NULL,
  scan_id TEXT REFERENCES scans(id) ON DELETE SET NULL,
  
  -- Generation details
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'both')),
  model TEXT NOT NULL, -- e.g., 'gpt-5', 'gemini-2.5-flash-image'
  
  -- Performance metrics
  duration_ms INTEGER NOT NULL, -- Generation time in milliseconds
  
  -- Token usage (for text generation)
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  
  -- Image generation
  images_generated INTEGER DEFAULT 0,
  
  -- Cost calculation (in USD)
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0.00,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'cached')),
  error TEXT,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit balances per organization (prepaid model)
CREATE TABLE IF NOT EXISTS credit_balances (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Credit balance (in USD)
  balance_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  
  -- Lifetime statistics
  total_purchased_usd DECIMAL(10, 2) DEFAULT 0.00,
  total_spent_usd DECIMAL(10, 6) DEFAULT 0.00,
  
  -- Usage counters (all-time)
  total_generations INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_images INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_balance CHECK (balance_usd >= 0)
);

-- Pricing configuration (can be updated without code changes)
CREATE TABLE IF NOT EXISTS pricing_config (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  
  -- Model identifier
  model TEXT NOT NULL UNIQUE,
  
  -- Pricing per 1M tokens (for text models)
  price_per_million_prompt_tokens DECIMAL(10, 6) DEFAULT 0,
  price_per_million_completion_tokens DECIMAL(10, 6) DEFAULT 0,
  
  -- Pricing per image (for image models)
  price_per_image DECIMAL(10, 6) DEFAULT 0,
  
  -- Metadata
  provider TEXT NOT NULL, -- 'openai', 'google', etc.
  active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing (GPT-5 for content, GPT-4o-mini for scan analysis, Gemini for images)
INSERT INTO pricing_config (model, provider, price_per_million_prompt_tokens, price_per_million_completion_tokens, price_per_image) VALUES
  ('gpt-5', 'openai', 1.25, 10.00, 0), -- Text generation (primary model for content)
  ('gpt-4o-mini', 'openai', 0.15, 0.60, 0), -- Scan analysis (cheaper for non-user-facing AI)
  ('gemini-2.5-flash-image', 'google', 0, 0, 0.04) -- Image generation ($0.04 cost, charge $0.12 for 3x margin)
ON CONFLICT (model) DO NOTHING;

-- Credit purchase history
CREATE TABLE IF NOT EXISTS credit_purchases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Purchase details
  amount_usd DECIMAL(10, 2) NOT NULL,
  payment_method TEXT, -- 'stripe', 'paypal', etc.
  payment_id TEXT, -- External payment ID
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Metadata
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_generation_logs_user_id ON generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_organization_id ON generation_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_project_id ON generation_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_draft_id ON generation_logs(draft_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_scan_id ON generation_logs(scan_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_type ON generation_logs(type);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);

CREATE INDEX IF NOT EXISTS idx_credit_balances_organization_id ON credit_balances(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_balance ON credit_balances(balance_usd);

CREATE INDEX IF NOT EXISTS idx_credit_purchases_organization_id ON credit_purchases(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_created_at ON credit_purchases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_config_model ON pricing_config(model);
CREATE INDEX IF NOT EXISTS idx_pricing_config_active ON pricing_config(active);

-- Enable RLS
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generation_logs
CREATE POLICY "Users can view their organization's generation logs"
  ON generation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()::text
      AND memberships.organization_id = generation_logs.organization_id
    )
  );

-- Service role can insert generation logs
CREATE POLICY "Service role can insert generation logs"
  ON generation_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for credit_balances
CREATE POLICY "Users can view their organization's credit balance"
  ON credit_balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()::text
      AND memberships.organization_id = credit_balances.organization_id
    )
  );

CREATE POLICY "Service role can manage credit balances"
  ON credit_balances FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for credit_purchases
CREATE POLICY "Users can view their organization's purchases"
  ON credit_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()::text
      AND memberships.organization_id = credit_purchases.organization_id
    )
  );

CREATE POLICY "Service role can manage purchases"
  ON credit_purchases FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for pricing_config (read-only for authenticated users)
CREATE POLICY "Authenticated users can view active pricing"
  ON pricing_config FOR SELECT
  USING (active = true);

-- Function to calculate cost for text generation
CREATE OR REPLACE FUNCTION calculate_text_generation_cost(
  p_model TEXT,
  p_prompt_tokens INTEGER,
  p_completion_tokens INTEGER
)
RETURNS DECIMAL(10, 6) AS $$
DECLARE
  v_prompt_price DECIMAL(10, 6);
  v_completion_price DECIMAL(10, 6);
  v_total_cost DECIMAL(10, 6);
BEGIN
  -- Get pricing for the model
  SELECT 
    price_per_million_prompt_tokens,
    price_per_million_completion_tokens
  INTO v_prompt_price, v_completion_price
  FROM pricing_config
  WHERE model = p_model AND active = true
  LIMIT 1;
  
  -- If model not found, return 0
  IF v_prompt_price IS NULL THEN
    RETURN 0.00;
  END IF;
  
  -- Calculate cost
  v_total_cost := 
    (p_prompt_tokens::DECIMAL / 1000000.0 * v_prompt_price) +
    (p_completion_tokens::DECIMAL / 1000000.0 * v_completion_price);
  
  RETURN ROUND(v_total_cost, 6);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate cost for image generation
CREATE OR REPLACE FUNCTION calculate_image_generation_cost(
  p_model TEXT,
  p_images_count INTEGER
)
RETURNS DECIMAL(10, 6) AS $$
DECLARE
  v_price_per_image DECIMAL(10, 6);
  v_total_cost DECIMAL(10, 6);
BEGIN
  -- Get pricing for the model
  SELECT price_per_image
  INTO v_price_per_image
  FROM pricing_config
  WHERE model = p_model AND active = true
  LIMIT 1;
  
  -- If model not found, return 0
  IF v_price_per_image IS NULL THEN
    RETURN 0.00;
  END IF;
  
  -- Calculate cost
  v_total_cost := p_images_count::DECIMAL * v_price_per_image;
  
  RETURN ROUND(v_total_cost, 6);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if organization has sufficient credits
CREATE OR REPLACE FUNCTION check_credits_available(
  p_organization_id TEXT,
  p_estimated_cost DECIMAL DEFAULT 0.01
)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance DECIMAL(10, 2);
BEGIN
  -- Get current balance
  SELECT balance_usd INTO v_balance
  FROM credit_balances
  WHERE organization_id = p_organization_id;
  
  -- If no balance record, create one with 0 balance
  IF v_balance IS NULL THEN
    INSERT INTO credit_balances (organization_id, balance_usd)
    VALUES (p_organization_id, 0.00);
    RETURN FALSE;
  END IF;
  
  -- Check if balance is sufficient (need at least estimated cost)
  RETURN v_balance >= p_estimated_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to deduct credits and update stats when generation completes
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
      total_images = total_images + NEW.images_generated,
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
        total_images
      )
      VALUES (
        NEW.organization_id, 
        -NEW.cost_usd, -- Negative balance (needs top-up)
        NEW.cost_usd,
        1,
        NEW.total_tokens,
        NEW.images_generated
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER deduct_credits_trigger
  AFTER INSERT ON generation_logs
  FOR EACH ROW
  EXECUTE FUNCTION deduct_credits_and_update_stats();

-- Function to add credits (called after successful payment)
CREATE OR REPLACE FUNCTION add_credits(
  p_organization_id TEXT,
  p_amount_usd DECIMAL(10, 2),
  p_purchase_id TEXT
)
RETURNS void AS $$
BEGIN
  -- Update balance
  UPDATE credit_balances
  SET 
    balance_usd = balance_usd + p_amount_usd,
    total_purchased_usd = total_purchased_usd + p_amount_usd,
    updated_at = NOW()
  WHERE organization_id = p_organization_id;
  
  -- Create balance record if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO credit_balances (
      organization_id,
      balance_usd,
      total_purchased_usd
    ) VALUES (
      p_organization_id,
      p_amount_usd,
      p_amount_usd
    );
  END IF;
  
  -- Mark purchase as completed
  UPDATE credit_purchases
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = p_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE generation_logs IS 'Tracks all AI generation requests for billing and analytics';
COMMENT ON TABLE credit_balances IS 'Prepaid credit balances per organization';
COMMENT ON TABLE credit_purchases IS 'Credit purchase history and payment records';
COMMENT ON TABLE pricing_config IS 'Configurable pricing for AI models';
COMMENT ON FUNCTION calculate_text_generation_cost IS 'Calculates cost for text generation based on token usage';
COMMENT ON FUNCTION calculate_image_generation_cost IS 'Calculates cost for image generation';
COMMENT ON FUNCTION check_credits_available IS 'Checks if organization has sufficient credits for generation';
COMMENT ON FUNCTION add_credits IS 'Adds credits to organization balance after successful payment';

