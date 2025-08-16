-- FINAL DATABASE SETUP FOR DNG MUSIC NOTATION APP
-- Copy and paste this entire code into your Supabase SQL Editor and click "Run"

-- Step 0: Drop existing tables if they exist (to ensure clean setup)
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS note_pages CASCADE;

-- Step 1: Create note_pages table
CREATE TABLE note_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create notes table
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES note_pages(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_notes_page_id ON notes(page_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);
CREATE INDEX idx_note_pages_created_at ON note_pages(created_at);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE note_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies for public access
CREATE POLICY "Allow all operations on note_pages" ON note_pages
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on notes" ON notes
    FOR ALL USING (true);

-- Step 6: Insert sample data
INSERT INTO note_pages (title) VALUES 
    ('Sample Composition 1'),
    ('Sample Composition 2'),
    ('My First Score');

-- Step 7: Insert sample notes for the first page
INSERT INTO notes (page_id, symbol, position_x, position_y)
SELECT 
    (SELECT id FROM note_pages WHERE title = 'Sample Composition 1' LIMIT 1),
    'a',
    170,
    230
WHERE EXISTS (SELECT 1 FROM note_pages WHERE title = 'Sample Composition 1');

-- Step 8: Verify tables were created
SELECT 'note_pages table created successfully' as status, COUNT(*) as record_count FROM note_pages
UNION ALL
SELECT 'notes table created successfully' as status, COUNT(*) as record_count FROM notes;
