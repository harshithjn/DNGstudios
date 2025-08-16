# Supabase Setup Guide for DNG Music Notation App

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `dng-music-notation`
   - Database Password: Choose a strong password
   - Region: Choose closest to you
5. Click "Create new project"

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL (looks like: `https://your-project-id.supabase.co`)
   - Anon public key (starts with `eyJ...`)

## Step 3: Update the Supabase Configuration

1. Open `src/lib/supabase.ts`
2. Replace the placeholder values with your actual credentials:

```typescript
const supabaseUrl = 'https://your-project-id.supabase.co' // Your actual project URL
const supabaseAnonKey = 'your-actual-anon-key' // Your actual anon key
```

## Step 4: Run the Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- `note_pages` table for storing project information
- `notes` table for storing note placements
- Proper indexes and relationships
- Sample data

## Step 5: Configure Row Level Security (Optional)

The schema includes basic RLS policies that allow all operations. For production use, you may want to:

1. Go to Authentication > Policies in your Supabase dashboard
2. Review and modify the policies based on your authentication needs
3. Consider adding user authentication if needed

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Create a new project
3. Add some notes to the score sheet
4. Verify that data is being saved to and loaded from Supabase

## Database Schema

### note_pages Table
- `id` (UUID, Primary Key): Unique identifier for each project
- `title` (TEXT): Project title
- `created_at` (TIMESTAMP): When the project was created

### notes Table
- `id` (UUID, Primary Key): Unique identifier for each note
- `page_id` (UUID, Foreign Key): References note_pages.id
- `symbol` (TEXT): The notation symbol (a-z, A-S)
- `position_x` (INTEGER): X coordinate on the score sheet
- `position_y` (INTEGER): Y coordinate on the score sheet
- `created_at` (TIMESTAMP): When the note was created

## Features Implemented

✅ **CRUD Operations for Projects:**
- Create new projects
- Fetch all projects
- Update project details
- Delete projects

✅ **CRUD Operations for Notes:**
- Add notes to projects
- Fetch notes for a project
- Update note positions
- Delete individual notes
- Clear all notes for a project

✅ **Real-time Integration:**
- Auto-save notes when they change
- Load projects from database on app start
- Persistent storage of all project data

✅ **Error Handling:**
- Loading states
- Error messages
- Graceful fallbacks

## Troubleshooting

### Common Issues:

1. **"Failed to load projects" error:**
   - Check your Supabase URL and anon key
   - Verify the database schema has been run
   - Check browser console for detailed error messages

2. **Notes not saving:**
   - Verify RLS policies allow write operations
   - Check network connectivity
   - Review browser console for errors

3. **Projects not loading:**
   - Ensure the `note_pages` table exists
   - Check that sample data was inserted
   - Verify API credentials are correct

### Debug Mode:

To enable debug logging, add this to your browser console:
```javascript
localStorage.setItem('supabase-debug', 'true')
```

## Next Steps

Consider adding these features:
- User authentication
- Project sharing
- Version history
- Export to different formats
- Real-time collaboration
