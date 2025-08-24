-- Rename user_profiles table to profiles and fix authentication issues
-- This migration addresses the table naming and foreign key constraint issues

-- First, drop existing policies and constraints
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- Drop foreign key constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Rename the table
ALTER TABLE user_profiles RENAME TO profiles;

-- Update the primary key column to be user_id instead of id
ALTER TABLE profiles RENAME COLUMN id TO user_id;

-- Add new foreign key constraint that references auth.users(id)
-- But make it more flexible for development
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create RLS policies for the renamed table
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Update other tables that reference user_profiles
-- Update user_learning_paths
ALTER TABLE user_learning_paths DROP CONSTRAINT IF EXISTS user_learning_paths_user_id_fkey;
ALTER TABLE user_learning_paths ADD CONSTRAINT user_learning_paths_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Update user_interview_preferences
ALTER TABLE user_interview_preferences DROP CONSTRAINT IF EXISTS user_interview_preferences_user_id_fkey;
ALTER TABLE user_interview_preferences ADD CONSTRAINT user_interview_preferences_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Update user_progress_tracking
ALTER TABLE user_progress_tracking DROP CONSTRAINT IF EXISTS user_progress_tracking_user_id_fkey;
ALTER TABLE user_progress_tracking ADD CONSTRAINT user_progress_tracking_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Update interview_analytics
ALTER TABLE interview_analytics DROP CONSTRAINT IF EXISTS interview_analytics_user_id_fkey;
ALTER TABLE interview_analytics ADD CONSTRAINT interview_analytics_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
