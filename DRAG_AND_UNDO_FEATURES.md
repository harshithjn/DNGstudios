# Note Drag & Move and Undo/Redo System

## Features Implemented

### 1. Note Drag & Move Functionality

**How it works:**
- Once notes are placed using keyboard or mouse, they become draggable
- Click and drag notes horizontally and vertically on the staff
- Notes snap to the nearest keyboard line when dragged vertically
- Horizontal movement is constrained within note boundaries
- Visual feedback shows when notes are being dragged (scaling and shadow effects)

**Controls:**
- **Drag to move**: Click and drag any placed note
- **Visual indicators**: 
  - Blue drag handle (⋮⋮) appears on hover
  - Red delete button (×) appears on hover
  - Notes scale up and get enhanced shadow when being dragged

**Constraints:**
- Notes snap to predefined keyboard line positions (Y-axis)
- Horizontal movement is limited to note boundary area
- Notes cannot be dragged outside the staff area

### 2. Undo & Redo System

**How it works:**
- Every action (placing, moving, deleting notes, adding text, adding articulations) is recorded
- Maintains a history stack of up to 50 states
- Allows reverting and reapplying changes

**Controls:**
- **Undo**: Ctrl+Z or click the "Undo" button
- **Redo**: Ctrl+Y or click the "Redo" button
- **Visual feedback**: Buttons are disabled when no actions are available

**Supported Actions:**
- ✅ Note placement (keyboard/mouse)
- ✅ Note deletion
- ✅ Note movement (drag & drop)
- ✅ Text element addition/deletion/movement
- ✅ Articulation element addition/deletion/movement
- ✅ Page clearing

### 3. Performance Optimizations

**Drag Performance:**
- Position updates are throttled to prevent excessive re-renders
- Only updates when position changes by more than 1 pixel
- Smooth visual feedback with CSS transitions

**Undo/Redo Performance:**
- History limited to 50 states to prevent memory issues
- Efficient state comparison to avoid unnecessary updates
- Debounced auto-save to database

### 4. User Experience Improvements

**Visual Feedback:**
- Cursor changes to "grab" when hovering over draggable notes
- Cursor changes to "grabbing" when actively dragging
- Notes scale and get enhanced shadows during drag
- Drag handles and delete buttons appear on hover

**Status Information:**
- Status banner shows current mode and available actions
- Keyboard shortcuts displayed in status bar
- Undo/Redo buttons show availability state

**Accessibility:**
- Keyboard shortcuts for undo/redo
- Tooltips on buttons showing keyboard shortcuts
- Proper focus management during interactions

## Technical Implementation

### Files Modified:
1. **`src/hooks/useUndoRedo.ts`** - New custom hook for undo/redo functionality
2. **`src/App.tsx`** - Integrated undo/redo system with state management
3. **`src/components/ScoreSheet.tsx`** - Added drag functionality and undo/redo UI

### Key Components:
- **useUndoRedo Hook**: Manages history stack with push, undo, redo operations
- **Drag Handlers**: Mouse event handlers for note dragging with constraints
- **State Management**: Integrated with existing Supabase backend
- **UI Components**: Undo/Redo buttons and visual feedback elements

### State Management:
- Separate undo/redo stacks for notes, text elements, and articulations
- Automatic state synchronization between undo/redo and main state
- Database persistence maintained for all operations

## Usage Instructions

1. **Place notes** using keyboard (a-z, A-S) or mouse click
2. **Drag notes** by clicking and dragging them to new positions
3. **Delete notes** by clicking the red × button or using Backspace/Delete
4. **Undo actions** using Ctrl+Z or the Undo button
5. **Redo actions** using Ctrl+Y or the Redo button
6. **Add text/articulations** and move them with drag & drop
7. **All changes** are automatically saved to the database

The system provides a smooth, intuitive experience for music notation editing with full undo/redo support and efficient drag & drop functionality.
