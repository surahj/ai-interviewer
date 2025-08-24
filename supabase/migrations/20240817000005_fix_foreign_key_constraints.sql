-- Make foreign key constraints more flexible for development
-- This allows the app to work even if users don't exist in auth.users table

-- Drop existing foreign key constraints
ALTER TABLE interviews DROP CONSTRAINT IF EXISTS interviews_user_id_fkey;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Recreate foreign key constraints with ON DELETE SET NULL for development
ALTER TABLE interviews ADD CONSTRAINT interviews_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id nullable in interviews table for development
ALTER TABLE interviews ALTER COLUMN user_id DROP NOT NULL;
