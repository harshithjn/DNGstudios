# Database Setup Instructions

## 🚨 Current Issue

The application is getting 400 errors because the database tables don't exist in your Supabase instance.

## ✅ Solution

### Step 1: Set up Supabase Database

1. **Go to your Supabase dashboard**: https://supabase.com/dashboard
2. **Select your project**: `esthiwvrzgfbvcndmeft`
3. **Go to SQL Editor**: Click on "SQL Editor" in the left sidebar
4. **Run the database setup script**: Copy and paste the entire contents of `DATABASE_SETUP.sql` into the SQL Editor
5. **Click "Run"** to execute the script

### Step 2: Verify Tables Created

After running the script, you should see:

- ✅ `projects` table created
- ✅ `pages` table created
- ✅ `notes` table created
- ✅ Row Level Security (RLS) enabled
- ✅ All indexes and triggers created

### Step 3: Test the Application

1. **Refresh your application** in the browser
2. **Try placing notes** by pressing keys (a-z, A-Z)
3. **Notes should now appear** on the scoresheet
4. **Undo/Redo should work** properly

## 🔧 Alternative: Local Testing (Temporary)

If you want to test the application without setting up the database first:

1. **The code is already modified** to bypass database operations temporarily
2. **Notes will be stored locally** in the browser state
3. **All features will work** except persistence between sessions

## 📋 Database Schema Overview

The setup script creates:

```sql
-- Core tables
projects (id, user_id, title, description, project_type, is_public, metadata, timestamps)
pages (id, project_id, page_number, title, notes, time_signature, key_signature, tempo, positions)
notes (id, page_id, notation_key, x_position, y_position, stave_index, octave, stem_direction)

-- Features
- Row Level Security (RLS) enabled
- Automatic timestamp triggers
- Performance indexes
- Helper functions for data access
```

## 🎯 Next Steps

1. **Run the database setup script** in Supabase SQL Editor
2. **Test note placement** - press keys to place notes
3. **Test undo/redo** - buttons should work
4. **Test cursor navigation** - Ctrl+Arrow keys should work
5. **All features should work** once database is set up

---

#

**After setting up the database, the 400 errors will disappear and all features will work properly!**
h
