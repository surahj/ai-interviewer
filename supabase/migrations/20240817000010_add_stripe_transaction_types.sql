-- Add new transaction types for Stripe payments
-- This migration adds support for pending, completed, and failed Stripe transactions

-- Update the credit_transactions table to support new transaction types
-- Drop the existing check constraint and add new one with Stripe transaction types
ALTER TABLE credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_transaction_type_check;

-- Add the new check constraint with all transaction types
ALTER TABLE credit_transactions ADD CONSTRAINT credit_transactions_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'purchase_pending', 'purchase_failed', 'usage', 'bonus', 'refund'));

-- Add a comment to document the new transaction types
COMMENT ON COLUMN credit_transactions.transaction_type IS 'Transaction types: purchase, purchase_pending, purchase_failed, usage, bonus, refund';

-- Create an index on metadata for faster lookups of Stripe session IDs
CREATE INDEX IF NOT EXISTS idx_credit_transactions_metadata_stripe_session 
ON credit_transactions ((metadata->>'stripe_session_id'));

-- Add a function to get transaction status
CREATE OR REPLACE FUNCTION get_transaction_status(transaction_type text)
RETURNS text AS $$
BEGIN
  CASE transaction_type
    WHEN 'purchase_pending' THEN RETURN 'pending';
    WHEN 'purchase' THEN RETURN 'completed';
    WHEN 'purchase_failed' THEN RETURN 'failed';
    WHEN 'usage' THEN RETURN 'completed';
    WHEN 'bonus' THEN RETURN 'completed';
    WHEN 'refund' THEN RETURN 'completed';
    ELSE RETURN 'unknown';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Add a view for payment transactions
CREATE OR REPLACE VIEW payment_transactions AS
SELECT 
  ct.id,
  ct.user_id,
  ct.transaction_type,
  ct.credits,
  ct.description,
  ct.package_id,
  ct.metadata,
  ct.created_at,
  get_transaction_status(ct.transaction_type) as status,
  cp.name as package_name,
  cp.price_cents as package_price
FROM credit_transactions ct
LEFT JOIN credit_packages cp ON ct.package_id = cp.id
WHERE ct.transaction_type IN ('purchase', 'purchase_pending', 'purchase_failed')
ORDER BY ct.created_at DESC;
