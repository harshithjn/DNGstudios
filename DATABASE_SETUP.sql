-- DNG DATABASE SETUP - FRESH INSTALL
-- This script creates a complete database schema for the DNG application
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: DROP EXISTING TABLES (IF THEY EXIST)
-- =====================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- =====================================================
-- STEP 2: CREATE TABLES
-- =====================================================

-- Projects table
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    project_type TEXT NOT NULL DEFAULT 'DNG' CHECK (project_type IN ('DNG', 'DNR')),
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pages table
CREATE TABLE pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    page_number INTEGER DEFAULT 1,
    title TEXT DEFAULT 'Page',
    notes JSONB DEFAULT '[]'::jsonb,
    time_signature JSONB DEFAULT '{"numerator": 4, "denominator": 4}'::jsonb,
    key_signature TEXT DEFAULT 'C',
    tempo INTEGER DEFAULT 120,
    keyboard_line_spacing INTEGER DEFAULT 100,
    key_signature_position JSONB DEFAULT '{"x": 50, "y": 100}'::jsonb,
    tempo_position JSONB DEFAULT '{"x": 50, "y": 150}'::jsonb,
    time_signature_position JSONB DEFAULT '{"x": 50, "y": 200}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table (for individual note tracking if needed)
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    notation_key TEXT NOT NULL,
    x_position INTEGER NOT NULL,
    y_position INTEGER NOT NULL,
    stave_index INTEGER DEFAULT 0,
    octave INTEGER DEFAULT 4,
  
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE INDEXES
-- =====================================================

-- Indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_pages_project_id ON pages(project_id);
CREATE INDEX idx_pages_page_number ON pages(project_id, page_number);
CREATE INDEX idx_notes_page_id ON notes(page_id);

-- =====================================================
-- STEP 4: CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at 
    BEFORE UPDATE ON pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 5: CREATE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Public projects policy
CREATE POLICY "Anyone can view public projects" ON projects
    FOR SELECT USING (is_public = true);

-- Pages policies
CREATE POLICY "Users can view pages of their projects" ON pages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert pages to their projects" ON pages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update pages of their projects" ON pages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete pages of their projects" ON pages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Notes policies
CREATE POLICY "Users can view notes of their projects" ON notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pages 
            JOIN projects ON projects.id = pages.project_id 
            WHERE pages.id = notes.page_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert notes to their projects" ON notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pages 
            JOIN projects ON projects.id = pages.project_id 
            WHERE pages.id = notes.page_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update notes of their projects" ON notes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pages 
            JOIN projects ON projects.id = pages.project_id 
            WHERE pages.id = notes.page_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete notes of their projects" ON notes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pages 
            JOIN projects ON projects.id = pages.project_id 
            WHERE pages.id = notes.page_id 
            AND projects.user_id = auth.uid()
        )
    );

-- =====================================================
-- STEP 6: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get all projects for a user
CREATE OR REPLACE FUNCTION get_user_projects(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    project_type TEXT,
    is_public BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.project_type,
        p.is_public,
        p.created_at,
        p.updated_at
    FROM projects p
    WHERE p.user_id = user_uuid
    ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a project with its pages
CREATE OR REPLACE FUNCTION get_project_with_pages(project_uuid UUID)
RETURNS TABLE (
    project_id UUID,
    project_title TEXT,
    project_description TEXT,
    project_type TEXT,
    page_id UUID,
    page_number INTEGER,
    page_title TEXT,
    notes JSONB,
    time_signature JSONB,
    key_signature TEXT,
    tempo INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as project_id,
        p.title as project_title,
        p.description as project_description,
        p.project_type,
        pg.id as page_id,
        pg.page_number,
        pg.title as page_title,
        pg.notes,
        pg.time_signature,
        pg.key_signature,
        pg.tempo
    FROM projects p
    LEFT JOIN pages pg ON p.id = pg.project_id
    WHERE p.id = project_uuid
    ORDER BY pg.page_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 7: CREATE SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample project (uncomment if you want sample data)
/*
INSERT INTO projects (user_id, title, description, project_type) 
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    'Sample DNG Project',
    'A sample project to get started',
    'DNG'
);

INSERT INTO pages (project_id, title, page_number)
VALUES (
    (SELECT id FROM projects WHERE title = 'Sample DNG Project' LIMIT 1),
    'Page 1',
    1
);
*/

-- =====================================================
-- STEP 8: VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('projects', 'pages', 'notes')
ORDER BY table_name, ordinal_position;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('projects', 'pages', 'notes');

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('projects', 'pages', 'notes');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'DNG Database setup completed successfully!';
    RAISE NOTICE 'Tables created: projects, pages, notes';
    RAISE NOTICE 'RLS enabled and policies configured';
    RAISE NOTICE 'Indexes and triggers created';
    RAISE NOTICE 'Helper functions created';
END $$;
