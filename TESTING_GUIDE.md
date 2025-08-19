# Testing Guide - Undo/Redo & Notation Placement

## 🎯 How to Test the Application

### 1. **Notation Placement Testing**

#### Method 1: Keyboard Mode (Default)
1. **Open the application** - You should see "Keyboard Mode Active" in the status banner
2. **Press keyboard keys** (a-z, A-Z) to place notes
3. **Notes will appear automatically** on the scoresheet
4. **Use Backspace/Delete** to remove the last note

#### Method 2: Click Mode
1. **Click the Keyboard button** in the toolbar to disable keyboard mode
2. **Select a notation** from the left sidebar (Note Palette)
3. **Click anywhere** on the scoresheet to place the selected notation
4. **Click on existing notes** to delete them

### 2. **Undo/Redo Testing**

#### Test Steps:
1. **Place some notes** using either method above
2. **Check the Undo button** - it should become enabled (not grayed out)
3. **Click Undo** - the last note should disappear
4. **Click Redo** - the note should reappear
5. **Use keyboard shortcuts**: Ctrl+Z (Undo), Ctrl+Y (Redo)

#### Expected Behavior:
- ✅ **Undo button enabled** after placing notes
- ✅ **Redo button enabled** after undoing
- ✅ **Notes disappear/appear** when using undo/redo
- ✅ **Keyboard shortcuts work** (Ctrl+Z, Ctrl+Y)

### 3. **Cursor Navigation Testing**

#### Test Steps:
1. **Place multiple notes** on the scoresheet
2. **Use Ctrl+Arrow keys** to navigate:
   - **Ctrl+Right**: Move to next note
   - **Ctrl+Left**: Move to previous note
   - **Ctrl+Up**: Move to note above
   - **Ctrl+Down**: Move to note below
3. **Look for the red blinking cursor** showing current position

#### Expected Behavior:
- ✅ **Red cursor appears** and blinks
- ✅ **Cursor moves** between notes with arrow keys
- ✅ **Works in both ScoreSheet and DNRScoresheet**

### 4. **Mode Switching Testing**

#### Test Steps:
1. **Switch between Normal and DNR modes** using the mode selector
2. **Test all features** in both modes
3. **Verify background changes** between modes

#### Expected Behavior:
- ✅ **Mode switching works** without errors
- ✅ **All features work** in both modes
- ✅ **Background images change** appropriately

## 🔧 Troubleshooting

### If Undo/Redo buttons are disabled:
1. **Check console** for any error messages
2. **Try placing a note first** - buttons should enable
3. **Refresh the page** and try again

### If notation placement doesn't work:
1. **Check the status banner** - it shows current mode
2. **For clicking**: Disable keyboard mode and select a notation
3. **For keyboard**: Enable keyboard mode and press keys
4. **Check console** for any error messages

### If cursor navigation doesn't work:
1. **Make sure you have notes** on the scoresheet
2. **Try Ctrl+Arrow keys** to navigate
3. **Look for the red blinking cursor**

## 📊 Expected Console Output

When working correctly, you should see:
```
pushState called: { currentNotesLength: 0, newNotesLength: 1, historyLength: 0, futureLength: 0 }
History updated: { oldLength: 0, newLength: 1 }
Undo/Redo state: { canUndo: true, canRedo: false, historyLength: 1, futureLength: 0 }
```

## 🎉 Success Criteria

The application is working correctly when:
- ✅ **Notes can be placed** by keyboard or clicking
- ✅ **Undo/Redo buttons work** and show correct state
- ✅ **Keyboard shortcuts work** (Ctrl+Z, Ctrl+Y)
- ✅ **Cursor navigation works** with Ctrl+Arrow keys
- ✅ **Mode switching works** between Normal and DNR
- ✅ **No console errors** appear

---

**Test this guide step by step to verify all features are working correctly!**
