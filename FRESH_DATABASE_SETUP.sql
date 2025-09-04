-- DNG FRESH DATABASE SETUP - SIMPLIFIED
-- This script creates a clean, simple database schema for the DNG application
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: DROP EXISTING TABLES (IF THEY EXIST)
-- =====================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS note_pages CASCADE;

-- =====================================================
-- STEP 2: CREATE SIMPLIFIED TABLES
-- =====================================================

-- Note pages table (projects)
CREATE TABLE note_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    composer TEXT DEFAULT 'Unknown Composer',
    description TEXT,
    project_type TEXT DEFAULT 'DNG' CHECK (project_type IN ('DNG', 'DNR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID REFERENCES note_pages(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    stave_index INTEGER DEFAULT 0,
    octave INTEGER DEFAULT 4,
    flipped BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE INDEXES
-- =====================================================

-- Indexes for better performance
CREATE INDEX idx_notes_page_id ON notes(page_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);
CREATE INDEX idx_note_pages_created_at ON note_pages(created_at);

-- =====================================================
-- STEP 4: DISABLE ROW LEVEL SECURITY (FOR SIMPLICITY)
-- =====================================================

-- Disable RLS for public access (simplified setup)
ALTER TABLE note_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: INSERT SAMPLE DATA
-- =====================================================

-- Insert sample projects
INSERT INTO note_pages (title, composer, description, project_type) VALUES
('Sample DNG Project', 'John Doe', 'A sample DNG project', 'DNG'),
('Sample DNR Project', 'Jane Smith', 'A sample DNR project', 'DNR'),
('My First Composition', 'Test User', 'Learning to compose', 'DNG');

-- Insert sample notes for the first project
INSERT INTO notes (page_id, symbol, position_x, position_y, stave_index, octave, flipped)
SELECT 
    np.id,
    'a',
    100,
    200,
    0,
    4,
    false
FROM note_pages np 
WHERE np.title = 'Sample DNG Project'
LIMIT 1;

-- =====================================================
-- STEP 6: VERIFICATION
-- =====================================================

-- Verify tables were created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('note_pages', 'notes')
ORDER BY table_name, ordinal_position;

-- Verify sample data
SELECT 
    np.title,
    np.composer,
    np.project_type,
    COUNT(n.id) as note_count
FROM note_pages np
LEFT JOIN notes n ON np.id = n.page_id
GROUP BY np.id, np.title, np.composer, np.project_type
ORDER BY np.created_at;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'DNG Fresh Database setup completed successfully!';
    RAISE NOTICE 'Tables created: note_pages, notes';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE 'Ready to use!';
END $$;
