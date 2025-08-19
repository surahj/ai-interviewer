-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE interview_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE interview_type AS ENUM ('technical', 'behavioral', 'mixed', 'case-study');
CREATE TYPE question_category AS ENUM ('technical', 'behavioral', 'problem-solving', 'communication');

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    level TEXT NOT NULL,
    candidate_name TEXT,
    interview_type interview_type NOT NULL DEFAULT 'mixed',
    duration INTEGER NOT NULL DEFAULT 30,
    focus_area TEXT NOT NULL DEFAULT 'general',
    custom_requirements TEXT,
    total_questions INTEGER NOT NULL DEFAULT 12,
    transcript JSONB,
    feedback JSONB,
    status interview_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create questions table (for Phase 2)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    level TEXT NOT NULL,
    question TEXT NOT NULL,
    type interview_type NOT NULL,
    category question_category NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table for additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferred_role TEXT,
    experience_level TEXT,
    skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_role_level ON questions(role, level);
CREATE INDEX IF NOT EXISTS idx_questions_type_category ON questions(type, category);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_interview_id ON interview_sessions(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_token ON interview_sessions(session_token);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_interviews_updated_at 
    BEFORE UPDATE ON interviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at 
    BEFORE UPDATE ON questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for interviews
CREATE POLICY "Users can view their own interviews" ON interviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interviews" ON interviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews" ON interviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interviews" ON interviews
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for questions (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view questions" ON questions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for interview_sessions
CREATE POLICY "Users can view their own interview sessions" ON interview_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM interviews 
            WHERE interviews.id = interview_sessions.interview_id 
            AND interviews.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own interview sessions" ON interview_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM interviews 
            WHERE interviews.id = interview_sessions.interview_id 
            AND interviews.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own interview sessions" ON interview_sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM interviews 
            WHERE interviews.id = interview_sessions.interview_id 
            AND interviews.user_id = auth.uid()
        )
    );

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_interview_stats(user_uuid UUID)
RETURNS TABLE (
    total_interviews BIGINT,
    completed_interviews BIGINT,
    average_score NUMERIC,
    total_duration BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_interviews,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_interviews,
        AVG((feedback->>'overallScore')::NUMERIC) as average_score,
        SUM(duration) as total_duration
    FROM interviews 
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get questions by role and level
CREATE OR REPLACE FUNCTION get_questions_by_role_level(
    p_role TEXT,
    p_level TEXT,
    p_type interview_type DEFAULT 'mixed',
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    question TEXT,
    type interview_type,
    category question_category,
    difficulty INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.question,
        q.type,
        q.category,
        q.difficulty
    FROM questions q
    WHERE q.role = p_role 
    AND q.level = p_level
    AND (p_type = 'mixed' OR q.type = p_type)
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate interview statistics
CREATE OR REPLACE FUNCTION calculate_interview_stats()
RETURNS TABLE (
    total_interviews BIGINT,
    active_interviews BIGINT,
    completed_interviews BIGINT,
    average_duration NUMERIC,
    most_common_role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_interviews,
        COUNT(*) FILTER (WHERE status = 'active') as active_interviews,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_interviews,
        AVG(duration) as average_duration,
        MODE() WITHIN GROUP (ORDER BY role) as most_common_role
    FROM interviews;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
