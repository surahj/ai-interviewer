-- Add openai_session_id field to interviews table for OpenAI Realtime sessions
ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS openai_session_id TEXT;

-- Create index for better performance when querying by OpenAI session ID
CREATE INDEX IF NOT EXISTS idx_interviews_openai_session_id ON interviews(openai_session_id);

-- Add comment to document the field
COMMENT ON COLUMN interviews.openai_session_id IS 'OpenAI Realtime session ID for realtime interviews';
