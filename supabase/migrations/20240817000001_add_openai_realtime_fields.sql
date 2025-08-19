-- Add OpenAI Realtime API fields to interviews table
ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS openai_session_id TEXT,
ADD COLUMN IF NOT EXISTS openai_session_token TEXT,
ADD COLUMN IF NOT EXISTS openai_session_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for OpenAI session ID
CREATE INDEX IF NOT EXISTS idx_interviews_openai_session_id ON interviews(openai_session_id);

-- Add comment to document the new fields
COMMENT ON COLUMN interviews.openai_session_id IS 'OpenAI Realtime API session ID';
COMMENT ON COLUMN interviews.openai_session_token IS 'OpenAI Realtime API session token';
COMMENT ON COLUMN interviews.openai_session_expires_at IS 'OpenAI Realtime API session expiration timestamp';
