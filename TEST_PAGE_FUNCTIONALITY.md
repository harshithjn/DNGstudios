# Test Page Functionality

## 🧪 How to Test New Page Creation and Data Persistence

### Test Steps:

1. **Open the App**

   - Go to `http://localhost:5173`
   - Click "Launch App"
   - Authenticate (or skip if not required)

2. **Create a New Project**

   - Click "New Project"
   - Fill in details:
     - Title: "Test Project"
     - Composer: "Test User"
     - Project Type: "DNG"
   - Click "Create"

3. **Add Notes to Page 1**

   - Press keys `a`, `b`, `c` to place some notes
   - Verify notes appear on the score sheet

4. **Create a New Page**

   - Click the "Add Page" button (blue button with + icon)
   - Verify a new page tab appears: "Page 2"
   - Verify you're now on Page 2 (empty)

5. **Add Notes to Page 2**

   - Press keys `d`, `e`, `f` to place notes on Page 2
   - Verify notes appear on Page 2

6. **Switch Between Pages**

   - Click on "Page 1" tab
   - Verify you see the original notes (a, b, c)
   - Click on "Page 2" tab
   - Verify you see the new notes (d, e, f)

7. **Test Persistence**

   - Close the browser tab
   - Reopen `http://localhost:5173`
   - Navigate back to your project
   - Verify both pages still exist with their notes

8. **Test Page Removal**
   - Go to Page 2
   - Click the X button on the Page 2 tab
   - Verify Page 2 is removed
   - Verify you're back on Page 1 with original notes

## ✅ Expected Results:

- ✅ New pages are created successfully
- ✅ Notes persist on each page
- ✅ Page switching works correctly
- ✅ Data persists after browser restart
- ✅ Page removal works correctly
- ✅ All data is saved to localStorage

## 🔧 Technical Details:

The new implementation:

- Uses `saveProjectPages()` to save all pages to localStorage
- Stores pages within the project structure in localStorage
- Maintains separate data for each page (notes, text elements, etc.)
- Auto-saves changes every 5 seconds
- Persists data between browser sessions

## 🐛 If Issues Occur:

1. **Check Browser Console**: Look for error messages
2. **Check localStorage**: Open DevTools > Application > Local Storage
3. **Verify Data Structure**: Look for `dng_projects` key in localStorage
4. **Clear localStorage**: If corrupted, clear browser data and restart

The page functionality should now work reliably with proper data persistence!
