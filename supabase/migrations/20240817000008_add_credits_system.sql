-- Add credits system
-- This migration adds credit management for users

-- Create credit packages table
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    available_credits INTEGER NOT NULL DEFAULT 0,
    total_credits_earned INTEGER NOT NULL DEFAULT 0,
    total_credits_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'bonus', 'refund')),
    credits INTEGER NOT NULL,
    description TEXT,
    package_id UUID REFERENCES credit_packages(id),
    interview_id UUID REFERENCES interviews(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for credit_packages (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view active credit packages" ON credit_packages
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Create RLS policies for user_credits
CREATE POLICY "Users can view their own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for credit_transactions
CREATE POLICY "Users can view their own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON credit_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_credit_packages_updated_at 
    BEFORE UPDATE ON credit_packages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at 
    BEFORE UPDATE ON user_credits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default credit packages
INSERT INTO credit_packages (name, description, credits, price_cents, is_active) VALUES
('Starter Pack', 'Perfect for trying out the platform', 50, 999, true),
('Professional Pack', 'Most popular choice for regular users', 150, 2499, true),
('Enterprise Pack', 'Best value for heavy users', 500, 7999, true);

-- Create function to initialize user credits (called on registration)
CREATE OR REPLACE FUNCTION initialize_user_credits(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_credits (user_id, available_credits, total_credits_earned)
    VALUES (user_uuid, 50, 50)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Add initial bonus transaction
    INSERT INTO credit_transactions (user_id, transaction_type, credits, description)
    VALUES (user_uuid, 'bonus', 50, 'Welcome bonus - 50 credits for new users');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate credit cost for interview duration
CREATE OR REPLACE FUNCTION calculate_interview_credits(duration_minutes INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Base rate: 1 credit per 3 minutes of interview
    -- Minimum 5 credits, maximum 50 credits per interview
    RETURN GREATEST(5, LEAST(50, CEIL(duration_minutes::NUMERIC / 3)));
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user has enough credits
CREATE OR REPLACE FUNCTION check_user_credits(user_uuid UUID, required_credits INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    available_credits INTEGER;
BEGIN
    SELECT available_credits INTO available_credits
    FROM user_credits
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(available_credits, 0) >= required_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to deduct credits for interview
CREATE OR REPLACE FUNCTION deduct_interview_credits(user_uuid UUID, interview_uuid UUID, duration_minutes INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    required_credits INTEGER;
    current_credits INTEGER;
BEGIN
    -- Calculate required credits
    required_credits := calculate_interview_credits(duration_minutes);
    
    -- Check current credits
    SELECT available_credits INTO current_credits
    FROM user_credits
    WHERE user_id = user_uuid;
    
    -- If not enough credits, return false
    IF COALESCE(current_credits, 0) < required_credits THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct credits
    UPDATE user_credits 
    SET 
        available_credits = available_credits - required_credits,
        total_credits_used = total_credits_used + required_credits,
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- Record transaction
    INSERT INTO credit_transactions (user_id, transaction_type, credits, description, interview_id)
    VALUES (user_uuid, 'usage', -required_credits, 
            format('Interview credits for %s minute session', duration_minutes), 
            interview_uuid);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add credits (for purchases)
CREATE OR REPLACE FUNCTION add_user_credits(user_uuid UUID, credits_to_add INTEGER, package_uuid UUID DEFAULT NULL, description TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- Update user credits
    INSERT INTO user_credits (user_id, available_credits, total_credits_earned)
    VALUES (user_uuid, credits_to_add, credits_to_add)
    ON CONFLICT (user_id) DO UPDATE SET
        available_credits = user_credits.available_credits + credits_to_add,
        total_credits_earned = user_credits.total_credits_earned + credits_to_add,
        updated_at = NOW();
    
    -- Record transaction
    INSERT INTO credit_transactions (user_id, transaction_type, credits, description, package_id)
    VALUES (user_uuid, 'purchase', credits_to_add, 
            COALESCE(description, format('Purchased %s credits', credits_to_add)), 
            package_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
