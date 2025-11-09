-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (copy from above)
-- ... table creation SQL from above ...

-- Create indexes for better performance
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_users_email ON users(email);