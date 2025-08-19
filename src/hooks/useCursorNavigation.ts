import { useState, useCallback, useEffect } from 'react'
import type { PlacedNotation } from '../hooks/useSupabase'

export interface CursorPosition {
  noteIndex: number
  x: number
  y: number
  isVisible: boolean
}

export const useCursorNavigation = (notes: PlacedNotation[]) => {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    noteIndex: -1,
    x: 0,
    y: 0,
    isVisible: false
  })
  const [isBlinking, setIsBlinking] = useState(false)

  // Disable blinking effect - cursor stays solid
  useEffect(() => {
    setIsBlinking(false)
  }, [])

  // Move to next note
  const moveToNextNote = useCallback(() => {
    if (notes.length === 0) return
    
    const nextIndex = cursorPosition.noteIndex < notes.length - 1 
      ? cursorPosition.noteIndex + 1 
      : 0
    
    const nextNote = notes[nextIndex]
    if (nextNote) {
      setCursorPosition({
        noteIndex: nextIndex,
        x: nextNote.x,
        y: nextNote.y,
        isVisible: true
      })
    }
  }, [notes, cursorPosition.noteIndex])

  // Move to previous note
  const moveToPreviousNote = useCallback(() => {
    if (notes.length === 0) return
    
    const prevIndex = cursorPosition.noteIndex > 0 
      ? cursorPosition.noteIndex - 1 
      : notes.length - 1
    
    const prevNote = notes[prevIndex]
    if (prevNote) {
      setCursorPosition({
        noteIndex: prevIndex,
        x: prevNote.x,
        y: prevNote.y,
        isVisible: true
      })
    }
  }, [notes, cursorPosition.noteIndex])

  // Move to note above (next staff line)
  const moveToNoteAbove = useCallback(() => {
    if (notes.length === 0) return
    
    const currentNote = notes[cursorPosition.noteIndex]
    if (!currentNote) return
    
    // Find the closest note above the current note
    const notesAbove = notes.filter(note => 
      note.y < currentNote.y && Math.abs(note.x - currentNote.x) < 50
    )
    
    if (notesAbove.length > 0) {
      const closestAbove = notesAbove.reduce((closest, note) => 
        Math.abs(note.y - currentNote.y) < Math.abs(closest.y - currentNote.y) ? note : closest
      )
      const noteIndex = notes.findIndex(note => note.id === closestAbove.id)
      
      setCursorPosition({
        noteIndex,
        x: closestAbove.x,
        y: closestAbove.y,
        isVisible: true
      })
    }
  }, [notes, cursorPosition.noteIndex])

  // Move to note below (previous staff line)
  const moveToNoteBelow = useCallback(() => {
    if (notes.length === 0) return
    
    const currentNote = notes[cursorPosition.noteIndex]
    if (!currentNote) return
    
    // Find the closest note below the current note
    const notesBelow = notes.filter(note => 
      note.y > currentNote.y && Math.abs(note.x - currentNote.x) < 50
    )
    
    if (notesBelow.length > 0) {
      const closestBelow = notesBelow.reduce((closest, note) => 
        Math.abs(note.y - currentNote.y) < Math.abs(closest.y - currentNote.y) ? note : closest
      )
      const noteIndex = notes.findIndex(note => note.id === closestBelow.id)
      
      setCursorPosition({
        noteIndex,
        x: closestBelow.x,
        y: closestBelow.y,
        isVisible: true
      })
    }
  }, [notes, cursorPosition.noteIndex])

  // Set cursor to specific note
  const setCursorToNote = useCallback((noteIndex: number) => {
    if (noteIndex >= 0 && noteIndex < notes.length) {
      const note = notes[noteIndex]
      setCursorPosition({
        noteIndex,
        x: note.x,
        y: note.y,
        isVisible: true
      })
    }
  }, [notes])

  // Hide cursor
  const hideCursor = useCallback(() => {
    setCursorPosition(prev => ({ ...prev, isVisible: false }))
  }, [])

  // Show cursor
  const showCursor = useCallback(() => {
    setCursorPosition(prev => ({ ...prev, isVisible: true }))
  }, [])

  // Handle keyboard navigation
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault()
          moveToNextNote()
          break
        case 'ArrowLeft':
          event.preventDefault()
          moveToPreviousNote()
          break
        case 'ArrowUp':
          event.preventDefault()
          moveToNoteAbove()
          break
        case 'ArrowDown':
          event.preventDefault()
          moveToNoteBelow()
          break
      }
    }
  }, [moveToNextNote, moveToPreviousNote, moveToNoteAbove, moveToNoteBelow])

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation)
    return () => document.removeEventListener('keydown', handleKeyboardNavigation)
  }, [handleKeyboardNavigation])

  return {
    cursorPosition,
    isBlinking,
    moveToNextNote,
    moveToPreviousNote,
    moveToNoteAbove,
    moveToNoteBelow,
    setCursorToNote,
    hideCursor,
    showCursor
  }
}
