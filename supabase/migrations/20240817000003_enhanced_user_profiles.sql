-- Enhanced user profiles for personalization
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS career_goals TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_companies TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_interview_styles TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS learning_preferences JSONB;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS skill_gaps TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS strengths TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS interview_preferences JSONB;

-- Create user_learning_paths table
CREATE TABLE IF NOT EXISTS user_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 1,
    target_level INTEGER NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    last_practiced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_interview_preferences table
CREATE TABLE IF NOT EXISTS user_interview_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preference_type TEXT NOT NULL, -- 'question_style', 'feedback_style', 'difficulty', etc.
    preference_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS interview_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_analytics JSONB, -- Detailed analysis of each question
    skill_breakdown JSONB, -- Skills assessed and scores
    improvement_areas JSONB, -- Areas that need work
    confidence_trends JSONB, -- Confidence level changes
    response_patterns JSONB, -- Response time, hesitation patterns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress_tracking table
CREATE TABLE IF NOT EXISTS user_progress_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_category TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    interview_count INTEGER DEFAULT 1,
    trend_direction TEXT CHECK (trend_direction IN ('improving', 'declining', 'stable')),
    last_assessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create adaptive_question_bank table
CREATE TABLE IF NOT EXISTS adaptive_question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    level TEXT NOT NULL,
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    expected_keywords TEXT[],
    scoring_criteria JSONB,
    follow_up_questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_user_id ON user_learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interview_preferences_user_id ON user_interview_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_analytics_user_id ON interview_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_tracking_user_id ON user_progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_question_bank_role_level ON adaptive_question_bank(role, level);

-- Enable RLS
ALTER TABLE user_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interview_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_question_bank ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own learning paths" ON user_learning_paths
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interview preferences" ON user_interview_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own interview analytics" ON interview_analytics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress tracking" ON user_progress_tracking
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "All authenticated users can view question bank" ON adaptive_question_bank
    FOR SELECT USING (auth.role() = 'authenticated');
