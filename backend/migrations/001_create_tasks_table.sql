-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Custom ENUM Types
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'TODO',
    priority task_priority DEFAULT 'MEDIUM',
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If table already exists, ensure columns are present:
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_email VARCHAR(255);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies
-- SELECT: Users can view tasks created by them OR assigned to them
DROP POLICY IF EXISTS "Users can select their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own or assigned tasks" ON tasks;
CREATE POLICY "Users can view their own or assigned tasks" 
ON tasks FOR SELECT 
USING (
    auth.uid() = user_id 
    OR auth.uid() = assigned_to
    OR auth.jwt() ->> 'email' = assigned_email
);

-- INSERT: Users can insert their own tasks
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
CREATE POLICY "Users can insert their own tasks" 
ON tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update tasks created by them or assigned to them
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update tasks" 
ON tasks FOR UPDATE 
USING (
    auth.uid() = user_id 
    OR auth.uid() = assigned_to
    OR auth.jwt() ->> 'email' = assigned_email
);

-- DELETE: Only creator can delete tasks
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks" 
ON tasks FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Trigger to auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ 
BEGIN 
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();