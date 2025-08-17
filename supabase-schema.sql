-- Supabase SQL Schema for DNG Music Notation App

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create note_pages table
CREATE TABLE IF NOT EXISTS note_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    composer TEXT DEFAULT 'Unknown Composer',
    description TEXT,
    project_type TEXT DEFAULT 'DNG' CHECK (project_type IN ('DNG', 'DNR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES note_pages(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_page_id ON notes(page_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_note_pages_created_at ON note_pages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE note_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your authentication needs)
-- For now, allowing all operations for simplicity
CREATE POLICY "Allow all operations on note_pages" ON note_pages
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on notes" ON notes
    FOR ALL USING (true);

-- Insert some sample data (optional)
INSERT INTO note_pages (title, composer, description, project_type) VALUES 
    ('Sample Composition 1', 'John Doe', 'A beautiful classical piece', 'DNG'),
    ('Sample Composition 2', 'Jane Smith', 'Modern jazz fusion', 'DNR'),
    ('My First Score', 'Unknown Composer', 'Learning composition', 'DNG')
ON CONFLICT DO NOTHING;

-- Insert sample notes for the first page
INSERT INTO notes (page_id, symbol, position_x, position_y)
SELECT 
    (SELECT id FROM note_pages WHERE title = 'Sample Composition 1' LIMIT 1),
    'a',
    170,
    230
WHERE EXISTS (SELECT 1 FROM note_pages WHERE title = 'Sample Composition 1')
ON CONFLICT DO NOTHING;
