-- Add session_id column to interviews table for real-time sessions
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create index for session_id for better performance
CREATE INDEX IF NOT EXISTS idx_interviews_session_id ON interviews(session_id);
