-- Fix ambiguous column reference in check_user_credits function
CREATE OR REPLACE FUNCTION check_user_credits(user_uuid UUID, required_credits INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    user_available_credits INTEGER;
BEGIN
    SELECT uc.available_credits INTO user_available_credits
    FROM user_credits uc
    WHERE uc.user_id = user_uuid;
    
    RETURN COALESCE(user_available_credits, 0) >= required_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
