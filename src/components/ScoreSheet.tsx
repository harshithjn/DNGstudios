"use client"
import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  Trash2,
  Music,
  Keyboard,
  RotateCcw,
  Download,
  Pen,
  Eraser,
  Settings,
  Type,
  Bold,
  Italic,
  Underline,
  Piano,
} from "lucide-react"
import { notations, getNotationByKey, type Notation } from "../data/notations"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import type { TextElement, ArticulationElement, LyricElement, HighlighterElement } from "../App"

import PianoComponent from "./Piano"
import type { ScoreMode } from "./ModeSelector"
import { useCursorNavigation } from "../hooks/useCursorNavigation"

interface PlacedNotation {
  id: string
  notation: Notation
  x: number
  y: number
  staveIndex: number
  octave: number
}

interface ScorePage {
  id: string
  title: string
  notes: PlacedNotation[]
  timeSignature: { numerator: number; denominator: number }
  keySignature: string
  tempo: number
  keyboardLineSpacing: number
  keySignaturePosition?: { x: number; y: number }
  tempoPosition?: { x: number; y: number }
  timeSignaturePosition?: { x: number; y: number }
}

interface ScoreSheetProps {
  selectedNotation: Notation | null
  currentPage: ScorePage
  onAddNote: (note: PlacedNotation) => void
  onRemoveNote: (noteId: string) => void
  onUpdateNote: (noteId: string, updates: Partial<PlacedNotation>) => void
  onClearPage: () => void
  onUpdatePageSettings: (settings: Partial<ScorePage>) => void
  textElements: TextElement[]
  onAddTextElement: (textElement: TextElement) => void
  onRemoveTextElement: (id: string) => void
  onUpdateTextElement: (id: string, updates: Partial<TextElement>) => void
  articulationElements: ArticulationElement[]
  onAddArticulation: (articulation: ArticulationElement) => void
  onRemoveArticulation: (id: string) => void
  onUpdateArticulation: (id: string, updates: Partial<ArticulationElement>) => void
  selectedArticulation: string | null
  isTextMode: boolean
  isLyricsMode?: boolean
  isHighlighterMode?: boolean
  selectedHighlighterColor?: 'red' | 'green' | 'blue' | 'yellow'
  lyricElements?: LyricElement[]
  onAddLyric?: (lyric: LyricElement) => void
  onRemoveLyric?: (id: string) => void
  onUpdateLyric?: (id: string, updates: Partial<LyricElement>) => void
  highlighterElements?: HighlighterElement[]
  onAddHighlighter?: (highlighter: HighlighterElement) => void

  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  scoreMode: ScoreMode

}

const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123
const INITIAL_KEYBOARD_NOTE_X_POSITION = 170
const NOTATION_VISUAL_WIDTH = 48
const NOTATION_KEYBOARD_X_INCREMENT = 50
const RENDERED_SCORESHEET_WIDTH = A4_WIDTH_PX * 1.3
const RENDERED_SCORESHEET_HEIGHT = A4_HEIGHT_PX * 1.3

const KEYBOARD_LINE_Y_POSITIONS = [230, 338, 446, 553, 659, 764, 872, 980, 1087, 1193, 1300]

const NOTE_BOUNDARY_LEFT = INITIAL_KEYBOARD_NOTE_X_POSITION
const NOTE_BOUNDARY_RIGHT = 1000





const midiNoteToNotationMap: { [key: number]: string } = {
  // a-z mapping (C3 to D5) - optimized for faster lookup
  48: "a",
  49: "b",
  50: "c",
  51: "d",
  52: "e",
  53: "f",
  54: "g",
  55: "h",
  56: "i",
  57: "j",
  58: "k",
  59: "l",
  60: "m",
  61: "n",
  62: "o",
  63: "p",
  64: "q",
  65: "r",
  66: "s",
  67: "t",
  68: "u",
  69: "v",
  70: "w",
  71: "x",
  72: "y",
  73: "z",
  // A-S mapping (D#5 to A#6) - extended range for better coverage
  74: "A",
  75: "B",
  76: "C",
  77: "D",
  78: "E",
  79: "F",
  80: "G",
  81: "H",
  82: "I",
  83: "J",
  84: "K",
  85: "L",
  86: "M",
  87: "N",
  88: "O",
  89: "P",
  90: "Q",
  91: "R",
  92: "S",
}

// const MIDI_DEBOUNCE_TIME = 10 // ms - prevent duplicate rapid-fire notes
// const MAX_SIMULTANEOUS_NOTES = 10 // Limit for performance stability

const KEY_SIGNATURE_OPTIONS = [
  { label: "C Major / A Minor", value: "C" },
  { label: "G Major / E Minor", value: "G" },
  { label: "D Major / B Minor", value: "D" },
  { label: "F Major / D Minor", value: "F" },
  { label: "B Major / G Minor", value: "B" },
]

const TIME_SIGNATURE_OPTIONS = [
  { label: "2/4", numerator: 2, denominator: 4 },
  { label: "3/4", numerator: 3, denominator: 4 },
  { label: "4/4", numerator: 4, denominator: 4 },
  { label: "6/8", numerator: 6, denominator: 8 },
  { label: "3/8", numerator: 3, denominator: 8 },
  { label: "5/4", numerator: 5, denominator: 4 },
  { label: "7/8", numerator: 7, denominator: 8 },
]

// Define default positions for score info elements
const DEFAULT_TIME_SIGNATURE_POS = { x: 150, y: 120 }
const DEFAULT_KEY_POS = { x: 150, y: 160 }
const DEFAULT_TEMPO_POS = { x: 150, y: 190 }

const ScoreSheet: React.FC<ScoreSheetProps> = ({
  selectedNotation,
  currentPage,
  onAddNote,
  onRemoveNote,
  onUpdateNote,
  onClearPage,
  onUpdatePageSettings,
  textElements,
  onAddTextElement,
  onRemoveTextElement,
  onUpdateTextElement,
  articulationElements,
  onAddArticulation,
  onRemoveArticulation,
  onUpdateArticulation,
  selectedArticulation,
  isTextMode,
  isLyricsMode = false,
  isHighlighterMode = false,
  selectedHighlighterColor = 'yellow',
  lyricElements = [],
  onAddLyric,
  onRemoveLyric,
  onUpdateLyric,
  highlighterElements = [],
  onAddHighlighter,





  canUndo,
  canRedo,
  onUndo,
  onRedo,
  scoreMode,

}) => {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showToolsDropdown, setShowToolsDropdown] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showPiano, setShowPiano] = useState(false)
  const [keyboardEnabled, setKeyboardEnabled] = useState(true)
  const [midiEnabled, setMidiEnabled] = useState(false)
  const [midiInputs, setMidiInputs] = useState<MIDIInput[]>([])
  const [nextNotePosition, setNextNotePosition] = useState(INITIAL_KEYBOARD_NOTE_X_POSITION)
  const [currentKeyboardLineIndex, setCurrentKeyboardLineIndex] = useState(0)
  const [showTextDialog, setShowTextDialog] = useState(false)
  const [textDialogPosition, setTextDialogPosition] = useState({ x: 0, y: 0 })
  const [newTextContent, setNewTextContent] = useState("")
  const [newTextSize, setNewTextSize] = useState(16)
  const [newTextBold, setNewTextBold] = useState(false)
  const [newTextItalic, setNewTextItalic] = useState(false)
  const [newTextUnderline, setNewTextUnderline] = useState(false)
  const [showLyricsDialog, setShowLyricsDialog] = useState(false)
  const [lyricsDialogPosition, setLyricsDialogPosition] = useState({ x: 0, y: 0 })
  const [newLyricsContent, setNewLyricsContent] = useState("")
  const [selectedNoteForLyrics, setSelectedNoteForLyrics] = useState<string | null>(null)

  // Cursor navigation
  const {
    cursorPosition,
    isBlinking,
    setCursorToNote
  } = useCursorNavigation(currentPage.notes)

  const midiTimeoutRef = useRef<{ [key: number]: number }>({})

  // const [lastMidiTime, setLastMidiTime] = useState<{ [key: number]: number }>({})
  // const [activeMidiNotes, setActiveMidiNotes] = useState<Set<number>>(new Set())

  // Moved useState calls inside the component and initialized from currentPage or defaults
  const [timeSignaturePos, setTimeSignaturePos] = useState(
    currentPage.timeSignaturePosition || DEFAULT_TIME_SIGNATURE_POS,
  )
  const [keyPos, setKeyPos] = useState(currentPage.keySignaturePosition || DEFAULT_KEY_POS)
  const [tempoPos, setTempoPos] = useState(currentPage.tempoPosition || DEFAULT_TEMPO_POS)

  // Calculate current keyboard line Y position
  const currentKeyboardLineY = KEYBOARD_LINE_Y_POSITIONS[currentKeyboardLineIndex]



  // Sync internal positions with currentPage props if they change externally
  useEffect(() => {
    setTimeSignaturePos(currentPage.timeSignaturePosition || DEFAULT_TIME_SIGNATURE_POS)
    setKeyPos(currentPage.keySignaturePosition || DEFAULT_KEY_POS)
    setTempoPos(currentPage.tempoPosition || DEFAULT_TEMPO_POS)
  }, [currentPage.timeSignaturePosition, currentPage.keySignaturePosition, currentPage.tempoPosition])



  // Calculate current measure and beat position (simplified)
  const getCurrentMeasureInfo = useCallback(() => {
    const { numerator } = currentPage.timeSignature
    const currentY = KEYBOARD_LINE_Y_POSITIONS[currentKeyboardLineIndex]
    const notesInCurrentLine = currentPage.notes.filter(note => 
      Math.abs(note.y - currentY) < 10
    ).length
    
    // Simple calculation based on notes in current line
    const currentMeasure = Math.floor(notesInCurrentLine / numerator) + 1
    const currentBeat = (notesInCurrentLine % numerator) + 1
    
    return {
      measureNumber: currentMeasure,
      beatNumber: currentBeat,
      totalBeats: numerator,
      isMeasureFull: notesInCurrentLine % numerator === 0
    }
  }, [currentPage.notes, currentKeyboardLineIndex, currentPage.timeSignature])







  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTool, setActiveTool] = useState<"none" | "pen" | "eraser">("none")
  const isInteracting = useRef(false)
  const currentLine = useRef<Array<{ x: number; y: number }>>([])
  const [drawingLines, setDrawingLines] = useState<Array<{ x: number; y: number }[]>>([])
  const [eraserSize] = useState(20)

  // Add drag state for text elements
  const [draggedTextId, setDraggedTextId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Drag state for articulation elements
  const [draggedArticulationId, setDraggedArticulationId] = useState<string | null>(null)
  const [articulationDragOffset, setArticulationDragOffset] = useState({ x: 0, y: 0 })
  const [resizingArticulationId, setResizingArticulationId] = useState<string | null>(null)
  const [resizeStartY, setResizeStartY] = useState(0)
  const [resizeStartHeight, setResizeStartHeight] = useState(0)

  // Drag state for notes
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const [noteDragOffset, setNoteDragOffset] = useState({ x: 0, y: 0 })
  const [isDraggingNote, setIsDraggingNote] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  // Drag state for lyrics
  const [draggedLyricId, setDraggedLyricId] = useState<string | null>(null)
  const [lyricDragOffset, setLyricDragOffset] = useState({ x: 0, y: 0 })

  // Highlighter state
  const [isDrawingHighlight, setIsDrawingHighlight] = useState(false)
  const [highlightStart, setHighlightStart] = useState({ x: 0, y: 0 })
  const [currentHighlight, setCurrentHighlight] = useState({ x: 0, y: 0, width: 0, height: 0 })



  // Keep ScoreSheet in sync with RightSidebar eraser (and future tools) via custom event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ tool: "none" | "pen" | "eraser" }>).detail
      if (!detail) return
      setActiveTool(detail.tool)
    }
    window.addEventListener("dng:tool", handler as EventListener)
    return () => window.removeEventListener("dng:tool", handler as EventListener)
  }, [])

  // Add drag handlers for text elements
  const handleTextMouseDown = useCallback(
    (e: React.MouseEvent, textId: string) => {
      e.preventDefault()
      e.stopPropagation()
      const textElement = textElements.find((t) => t.id === textId)
      if (!textElement) return

      setDraggedTextId(textId)
      setDragOffset({
        x: e.clientX - textElement.x,
        y: e.clientY - textElement.y,
      })
    },
    [textElements],
  )

  const handleTextMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedTextId) return
      e.preventDefault()

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      onUpdateTextElement(draggedTextId, { x: newX, y: newY })
    },
    [draggedTextId, dragOffset, onUpdateTextElement],
  )

  const handleTextMouseUp = useCallback(() => {
    setDraggedTextId(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  const handleArticulationMouseDown = useCallback(
    (e: React.MouseEvent, articulationId: string) => {
      e.preventDefault()
      e.stopPropagation()
      const art = articulationElements.find((a) => a.id === articulationId)
      if (!art) return

      setDraggedArticulationId(articulationId)
      setArticulationDragOffset({
        x: e.clientX - art.x,
        y: e.clientY - art.y,
      })
    },
    [articulationElements],
  )

  const handleArticulationResizeMouseDown = useCallback(
    (e: React.MouseEvent, articulationId: string) => {
      e.preventDefault()
      e.stopPropagation()
      const art = articulationElements.find((a) => a.id === articulationId)
      if (!art) return

      setResizingArticulationId(articulationId)
      setResizeStartY(e.clientY)
      setResizeStartHeight(art.height || 100)
    },
    [articulationElements],
  )

  const handleArticulationMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedArticulationId && !resizingArticulationId) return
      e.preventDefault()
      
      if (draggedArticulationId) {
        const newX = e.clientX - articulationDragOffset.x
        const newY = e.clientY - articulationDragOffset.y
        onUpdateArticulation?.(draggedArticulationId, { x: newX, y: newY })
      }
      
      if (resizingArticulationId) {
        const deltaY = e.clientY - resizeStartY
        const newHeight = Math.max(20, resizeStartHeight + deltaY)
        onUpdateArticulation?.(resizingArticulationId, { height: newHeight })
      }
    },
    [draggedArticulationId, articulationDragOffset, onUpdateArticulation, resizingArticulationId, resizeStartY, resizeStartHeight],
  )

  const handleArticulationMouseUp = useCallback(() => {
    setDraggedArticulationId(null)
    setArticulationDragOffset({ x: 0, y: 0 })
    setResizingArticulationId(null)
  }, [])

  // Note drag handlers
  const handleNoteMouseDown = useCallback(
    (e: React.MouseEvent, noteId: string) => {
      e.preventDefault()
      e.stopPropagation()
      
      const note = currentPage.notes.find((n) => n.id === noteId)
      if (!note) return

      // Set the selected note
      setSelectedNoteId(noteId)
      
      // Start dragging
      setDraggedNoteId(noteId)
      setNoteDragOffset({
        x: e.clientX - note.x,
        y: e.clientY - note.y,
      })
      setIsDraggingNote(true)
    },
    [currentPage.notes],
  )

  const handleNoteMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedNoteId || !isDraggingNote) return
      e.preventDefault()

      const newX = e.clientX - noteDragOffset.x
      const newY = e.clientY - noteDragOffset.y

      // Allow free movement within the canvas bounds
      const canvasWidth = RENDERED_SCORESHEET_WIDTH
      const canvasHeight = RENDERED_SCORESHEET_HEIGHT
      
      // Constrain to canvas boundaries with some padding
      const padding = 50
      const constrainedX = Math.max(padding, Math.min(newX, canvasWidth - padding))
      const constrainedY = Math.max(padding, Math.min(newY, canvasHeight - padding))

      // Only update if position actually changed to avoid unnecessary re-renders
      const note = currentPage.notes.find(n => n.id === draggedNoteId)
      if (note && (Math.abs(note.x - constrainedX) > 1 || Math.abs(note.y - constrainedY) > 1)) {
        onUpdateNote(draggedNoteId, { x: constrainedX, y: constrainedY })
      }
    },
    [draggedNoteId, isDraggingNote, noteDragOffset, onUpdateNote, currentPage.notes],
  )

  const handleNoteMouseUp = useCallback(() => {
    setDraggedNoteId(null)
    setNoteDragOffset({ x: 0, y: 0 })
    setIsDraggingNote(false)
    // Don't clear selectedNoteId here - keep it selected after dragging
  }, [])

  // Lyrics drag handlers
  const handleLyricMouseDown = useCallback(
    (e: React.MouseEvent, lyricId: string) => {
      e.preventDefault()
      e.stopPropagation()
      const lyricElement = lyricElements.find((l) => l.id === lyricId)
      if (!lyricElement) return

      setDraggedLyricId(lyricId)
      setLyricDragOffset({
        x: e.clientX - lyricElement.x,
        y: e.clientY - lyricElement.y,
      })
    },
    [lyricElements],
  )

  const handleLyricMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedLyricId) return
      e.preventDefault()

      const newX = e.clientX - lyricDragOffset.x
      const newY = e.clientY - lyricDragOffset.y

      onUpdateLyric?.(draggedLyricId, { x: newX, y: newY })
    },
    [draggedLyricId, lyricDragOffset, onUpdateLyric],
  )

  const handleLyricMouseUp = useCallback(() => {
    setDraggedLyricId(null)
    setLyricDragOffset({ x: 0, y: 0 })
  }, [])

  // Highlighter handlers
  const handleHighlighterMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isHighlighterMode) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    setIsDrawingHighlight(true)
    setHighlightStart({ x, y })
    setCurrentHighlight({ x, y, width: 0, height: 0 })
  }, [isHighlighterMode])

  const handleHighlighterMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingHighlight || !isHighlighterMode) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const width = x - highlightStart.x
    const height = y - highlightStart.y
    
    setCurrentHighlight({
      x: width < 0 ? x : highlightStart.x,
      y: height < 0 ? y : highlightStart.y,
      width: Math.abs(width),
      height: Math.abs(height)
    })
  }, [isDrawingHighlight, isHighlighterMode, highlightStart])

  const handleHighlighterMouseUp = useCallback(() => {
    if (!isDrawingHighlight || !isHighlighterMode) return
    
    if (currentHighlight.width > 5 && currentHighlight.height > 5) {
      const newHighlighter: HighlighterElement = {
        id: Date.now().toString(),
        x: currentHighlight.x,
        y: currentHighlight.y,
        width: currentHighlight.width,
        height: currentHighlight.height,
        color: selectedHighlighterColor,
        opacity: 0.3
      }
      
      onAddHighlighter?.(newHighlighter)
    }
    
    setIsDrawingHighlight(false)
    setCurrentHighlight({ x: 0, y: 0, width: 0, height: 0 })
  }, [isDrawingHighlight, isHighlighterMode, currentHighlight, selectedHighlighterColor, onAddHighlighter])



  // const handleScoreInfoMouseMove = useCallback(
  //   (e: React.MouseEvent) => {
  //     if (!draggedScoreInfoId) return
  //     e.preventDefault()
  //
  //     const newX = e.clientX - scoreInfoDragOffset.x
  //     const newY = e.clientY - scoreInfoDragOffset.y
  //
  //     if (draggedScoreInfoId === "timeSignature") {
  //       setTimeSignaturePos({ x: newX, y: newY })
  //     } else if (draggedScoreInfoId === "key") {
  //       setKeyPos({ x: newX, y: newY })
  //     } else {
  //       // tempo
  //       setTempoPos({ x: newX, y: newY })
  //     }
  //   },
  //   [draggedScoreInfoId, scoreInfoDragOffset],
  // )

  // const handleScoreInfoMouseUp = useCallback(() => {
  //   if (!draggedScoreInfoId) return
  //
  //   // Persist the new positions to currentPage
  //   if (draggedScoreInfoId === "timeSignature") {
  //     onUpdatePageSettings({ timeSignaturePosition: timeSignaturePos })
  //   } else if (draggedScoreInfoId === "key") {
  //     onUpdatePageSettings({ keySignaturePosition: keyPos })
  //   } else {
  //     // tempo
  //     onUpdatePageSettings({ tempoPosition: tempoPos })
  //   }
  // }, [draggedScoreInfoId, timeSignaturePos, keyPos, tempoPos, onUpdatePageSettings])



  // Optimized function to delete the last note
  const deleteLastNote = useCallback(() => {
    console.log("deleteLastNote called, notes length:", currentPage.notes.length)
    if (currentPage.notes.length > 0) {
      const lastNote = currentPage.notes[currentPage.notes.length - 1]
      console.log("Deleting note with ID:", lastNote.id, "Type:", typeof lastNote.id)
      onRemoveNote(lastNote.id)
    } else {
      console.log("No notes to delete")
    }
  }, [currentPage.notes, onRemoveNote])

  const placeNotation = useCallback(
    (mappedNotation: Notation, customX?: number, customY?: number) => {
      console.log('placeNotation called with:', { mappedNotation, customX, customY })
      console.log('Current state:', { nextNotePosition, currentKeyboardLineY, currentKeyboardLineIndex })
      let finalX = customX ?? nextNotePosition
      let finalY = customY ?? currentKeyboardLineY

      // If custom position is provided, use it directly
      if (customX !== undefined && customY !== undefined) {
        const newNote: PlacedNotation = {
          id: Date.now().toString(),
          notation: mappedNotation,
          x: finalX,
          y: finalY,
          staveIndex: 0,
          octave: 4,
        }
        console.log('Calling onAddNote with:', newNote)
        onAddNote(newNote)
        console.log('onAddNote called successfully')
        
        // Update cursor position to after the placed note
        setNextNotePosition(finalX + NOTATION_KEYBOARD_X_INCREMENT)
        
        // Update keyboard line position based on the placed note
        const lineIndex = KEYBOARD_LINE_Y_POSITIONS.findIndex(y => Math.abs(y - finalY) < 10)
        if (lineIndex !== -1) {
          setCurrentKeyboardLineIndex(lineIndex)
        }
        return
      }

      // Check if we need to move to the next line due to horizontal overflow
      if (finalX + NOTATION_VISUAL_WIDTH > NOTE_BOUNDARY_RIGHT) {
        const nextLineIndex = currentKeyboardLineIndex + 1
        if (nextLineIndex < KEYBOARD_LINE_Y_POSITIONS.length) {
          setCurrentKeyboardLineIndex(nextLineIndex)
          finalX = NOTE_BOUNDARY_LEFT
          finalY = KEYBOARD_LINE_Y_POSITIONS[nextLineIndex]
        } else {
          // If no more lines, wrap back to first line
          setCurrentKeyboardLineIndex(0)
          finalX = NOTE_BOUNDARY_LEFT
          finalY = KEYBOARD_LINE_Y_POSITIONS[0]
        }
      }

      const newNote: PlacedNotation = {
        id: Date.now().toString(),
        notation: mappedNotation,
        x: finalX,
        y: finalY,
        staveIndex: 0,
        octave: 4,
      }
      console.log('Calling onAddNote with (keyboard):', newNote)
      onAddNote(newNote)

      setNextNotePosition(finalX + NOTATION_KEYBOARD_X_INCREMENT)
    },
    [
      nextNotePosition,
      currentKeyboardLineIndex,
      currentKeyboardLineY,
      onAddNote,
      setNextNotePosition,
      setCurrentKeyboardLineIndex,
    ],
  )

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      console.log('Key pressed:', event.key, 'Keyboard enabled:', keyboardEnabled)
      
      if (
        !keyboardEnabled ||
        showSettingsDropdown ||
        showKeyboardHelp ||
        showToolsDropdown ||
        activeTool !== "none" ||
        showTextDialog ||
        showLyricsDialog ||
        isLyricsMode
      ) {
        console.log('Key press blocked by conditions:', {
          keyboardEnabled,
          showSettingsDropdown,
          showKeyboardHelp,
          showToolsDropdown,
          activeTool,
          showTextDialog,
          showLyricsDialog,
          isLyricsMode
        })
        return
      }
      const target = event.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        console.log('Key press blocked by target element:', target.tagName)
        return
      }

      const key = event.key
      const mappedNotation = getNotationByKey(key)
      console.log('Mapped notation for key:', key, mappedNotation)

      // Lyrics shortcut (Ctrl+L)
      if ((event.ctrlKey || event.metaKey) && key === 'l') {
        event.preventDefault()
        event.stopPropagation()
        if (selectedNoteId) {
          setSelectedNoteForLyrics(selectedNoteId)
          const note = currentPage.notes.find(n => n.id === selectedNoteId)
          if (note) {
            setLyricsDialogPosition({ x: note.x, y: note.y + 50 })
            setShowLyricsDialog(true)
          }
        }
        return
      }

      if (key === "Backspace" || key === "Delete") {
        event.preventDefault()
        event.stopPropagation()
        console.log("Backspace/Delete key pressed")
        deleteLastNote()
        return
      }

      if (key === "Enter") {
        event.preventDefault()
        event.stopPropagation()
        setNextNotePosition(INITIAL_KEYBOARD_NOTE_X_POSITION)
        setCurrentKeyboardLineIndex((prevIndex) => {
          const newIndex = prevIndex + 1
          if (newIndex < KEYBOARD_LINE_Y_POSITIONS.length) {
            return newIndex
          } else {
            console.warn("Reached maximum number of lines (11). Cannot add more lines with Enter.")
            return prevIndex
          }
        })
        return
      }

      if (mappedNotation) {
        event.preventDefault()
        event.stopPropagation()
        console.log('Calling placeNotation with:', mappedNotation)
        placeNotation(mappedNotation)
      } else {
        console.log('No notation mapped for key:', key)
      }
    },
    [
      keyboardEnabled,
      showSettingsDropdown,
      showKeyboardHelp,
      showToolsDropdown,
      activeTool,
      showTextDialog,
      showLyricsDialog,
      isLyricsMode,
      selectedNoteId,
      currentPage.notes,
      deleteLastNote,
      placeNotation,
      setNextNotePosition,
      setCurrentKeyboardLineIndex,
    ],
  )

  const handleMidiMessage = useCallback(
    (event: MIDIMessageEvent) => {
      if (!midiEnabled || showSettingsDropdown || showKeyboardHelp || showToolsDropdown || activeTool !== "none") return

      if (!event.data || event.data.length < 3) {
        console.warn("Invalid MIDI message data.")
        return
      }

      const status = event.data[0]
      const note = event.data[1]
      const velocity = event.data[2]

      const NOTE_ON = 0x90

      // Handle Note ON messages with velocity > 0
      if ((status & 0xf0) === NOTE_ON && velocity > 0) {
        const mappedAlphabet = midiNoteToNotationMap[note]
        if (mappedAlphabet) {
          const mappedNotation = getNotationByKey(mappedAlphabet)
          if (mappedNotation) {
            placeNotation(mappedNotation)
          }
        }
      }
    },
    [midiEnabled, showSettingsDropdown, showKeyboardHelp, showToolsDropdown, activeTool, placeNotation],
  )

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== "none") {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (isTextMode) {
      setTextDialogPosition({ x, y })
      setShowTextDialog(true)
      return
    }

    if (isLyricsMode) {
      // In lyrics mode, clicking anywhere will show the lyrics dialog
      setLyricsDialogPosition({ x, y })
      setShowLyricsDialog(true)
      return
    }

    if (isHighlighterMode) {
      // In highlighter mode, don't handle clicks
      return
    }

    if (selectedArticulation) {
      const articulations: Array<{ id: string; name: string; symbol: string; isExtensible?: boolean }> = [
        { id: "staccato", name: "Staccato", symbol: "." },
        { id: "accent", name: "Accent", symbol: ">" },
        { id: "tenuto", name: "Tenuto", symbol: "—" },
        { id: "marcato", name: "Marcato", symbol: "^" },
        { id: "fermata", name: "Fermata", symbol: "𝄐" },
        { id: "trill", name: "Trill", symbol: "tr" },
        { id: "mordent", name: "Mordent", symbol: "𝄽" },
        { id: "turn", name: "Turn", symbol: "𝄾" },
        { id: "slur", name: "Slur", symbol: "⌒" },
        { id: "tie", name: "Tie", symbol: "⌒" },
        { id: "black-dot", name: "Black Dot", symbol: "●" },
        { id: "outline-dot", name: "Outline Dot", symbol: "○" },
      ]

      const barLines: Array<{ id: string; name: string; symbol: string; isExtensible?: boolean }> = [
        { id: "bar-line", name: "Bar Line", symbol: "|", isExtensible: true },
        { id: "double-bar-line", name: "Double Bar Line", symbol: "||", isExtensible: true },
      ]

      const articulation = articulations.find((a) => a.id === selectedArticulation) || 
                          barLines.find((a) => a.id === selectedArticulation)
      if (articulation) {
        const newArticulation: ArticulationElement = {
          id: Date.now().toString(),
          type: articulation.id,
          name: articulation.name,
          symbol: articulation.symbol,
          x: Math.max(20, Math.min(x, rect.width - 20)),
          y: Math.max(20, Math.min(y, rect.height - 20)),
          height: articulation.isExtensible ? 100 : undefined, // Default height for extensible elements
          isExtensible: articulation.isExtensible || false,
        }
        onAddArticulation(newArticulation)
      }
      return
    }

    if (!selectedNotation) {
      return
    }

    // Use the improved placeNotation function with custom position
    placeNotation(selectedNotation, x, y)
  }

  // Handle mouse move to update cursor position for note placement
  const handleNotePlacementMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== "none" || !selectedNotation || isTextMode || isLyricsMode || selectedArticulation || keyboardEnabled || midiEnabled) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Constrain x position to note boundaries
    const constrainedX = Math.max(NOTE_BOUNDARY_LEFT, Math.min(x, NOTE_BOUNDARY_RIGHT - NOTATION_VISUAL_WIDTH))
    
    // Update cursor position for visual feedback
    setNextNotePosition(constrainedX)
    
    // Find the closest keyboard line
    const closestLineIndex = KEYBOARD_LINE_Y_POSITIONS.reduce((closest, current, index) => {
      return Math.abs(current - y) < Math.abs(KEYBOARD_LINE_Y_POSITIONS[closest] - y) ? index : closest
    }, 0)
    
    setCurrentKeyboardLineIndex(closestLineIndex)
  }, [activeTool, selectedNotation, isTextMode, isLyricsMode, selectedArticulation, keyboardEnabled, midiEnabled])

  const handleAddText = () => {
    if (!newTextContent.trim()) return

    const newTextElement: TextElement = {
      id: Date.now().toString(),
      text: newTextContent,
      x: textDialogPosition.x,
      y: textDialogPosition.y,
      fontSize: newTextSize,
      bold: newTextBold,
      italic: newTextItalic,
      underline: newTextUnderline,
    }

    onAddTextElement(newTextElement)
    setShowTextDialog(false)
    setNewTextContent("")
    setNewTextSize(16)
    setNewTextBold(false)
    setNewTextItalic(false)
    setNewTextUnderline(false)
  }

  const handleAddLyrics = () => {
    if (!newLyricsContent.trim()) return

    const newLyricElement: LyricElement = {
      id: Date.now().toString(),
      noteId: selectedNoteForLyrics || "", // Can be empty if no specific note is selected
      text: newLyricsContent,
      x: lyricsDialogPosition.x,
      y: lyricsDialogPosition.y,
      fontSize: 14,
    }

    onAddLyric?.(newLyricElement)
    setShowLyricsDialog(false)
    setNewLyricsContent("")
    setSelectedNoteForLyrics(null)
  }

  const drawLine = useCallback((ctx: CanvasRenderingContext2D, line: { x: number; y: number }[]) => {
    if (line.length < 2) return
    ctx.beginPath()
    ctx.moveTo(line[0].x, line[0].y)
    for (let i = 1; i < line.length; i++) {
      ctx.lineTo(line[i].x, line[i].y)
    }
    ctx.stroke()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "black"
    ctx.globalCompositeOperation = "source-over"

    drawingLines.forEach((line) => drawLine(ctx, line))
  }, [drawingLines, drawLine])

  const eraseArticulationsAt = useCallback(
    (x: number, y: number) => {
      const threshold = eraserSize
      const toRemove: string[] = []
      for (const art of articulationElements) {
        const dx = x - art.x
        const dy = y - art.y
        if (Math.hypot(dx, dy) <= threshold) {
          toRemove.push(art.id)
        }
      }
      Array.from(new Set(toRemove)).forEach((id) => onRemoveArticulation(id))
    },
    [articulationElements, eraserSize, onRemoveArticulation],
  )

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (activeTool === "none" || !canvasRef.current) return
      isInteracting.current = true
      const rect = canvasRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const ctx = canvasRef.current.getContext("2d")
      if (!ctx) return

      if (activeTool === "pen") {
        currentLine.current = [{ x, y }]
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.strokeStyle = "black"
        ctx.globalCompositeOperation = "source-over"
      } else if (activeTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.beginPath()
        ctx.arc(x, y, eraserSize / 2, 0, Math.PI * 2)
        ctx.fill()
        eraseArticulationsAt(x, y)
      }
    },
    [activeTool, eraserSize, eraseArticulationsAt],
  )

  const handleDrawingMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isInteracting.current || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const ctx = canvasRef.current.getContext("2d")
      if (!ctx) return

      if (activeTool === "pen") {
        ctx.lineTo(x, y)
        ctx.stroke()
        currentLine.current.push({ x, y })
      } else if (activeTool === "eraser") {
        ctx.beginPath()
        ctx.arc(x, y, eraserSize / 2, 0, Math.PI * 2)
        ctx.fill()
        eraseArticulationsAt(x, y)
      }
    },
    [activeTool, eraserSize, eraseArticulationsAt],
  )

  const handleMouseUp = useCallback(() => {
    if (!isInteracting.current) return
    isInteracting.current = false
    const ctx = canvasRef.current?.getContext("2d")
    if (ctx) {
      ctx.globalCompositeOperation = "source-over"
    }

    if (activeTool === "pen") {
      if (currentLine.current.length > 1) {
        setDrawingLines((prev) => [...prev, currentLine.current])
      }
      currentLine.current = []
    }
  }, [activeTool])

  const handleClearAll = () => {
    onClearPage()
    setDrawingLines([])
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const exportToPDF = async () => {
    const scoresheetElement = document.querySelector(".scoresheet-area") as HTMLElement
    if (!scoresheetElement) return

    try {
      const canvas = await html2canvas(scoresheetElement, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        width: scoresheetElement.offsetWidth,
        height: scoresheetElement.offsetHeight,
      })

      const imgData = canvas.toDataURL("image/png")

      const pxToMm = 25.4 / 96
      const imgWidthMm = canvas.width * pxToMm
      const imgHeightMm = canvas.height * pxToMm

      const pdf = new jsPDF({
        orientation: imgWidthMm > imgHeightMm ? "landscape" : "portrait",
        unit: "mm",
        format: [imgWidthMm, imgHeightMm],
      })

      pdf.addImage(imgData, "PNG", 0, 0, imgWidthMm, imgHeightMm)
      pdf.save(`${currentPage.title}.pdf`)
    } catch (error) {
      console.error("Error exporting to PDF:", error)
    }
  }

  const handleToolToggle = (tool: "pen" | "eraser") => {
    setActiveTool((prev) => (prev === tool ? "none" : tool))
    setShowToolsDropdown(false)
  }

  const getCursorStyle = useCallback(() => {
    if (isDraggingNote) return "grabbing"
    if (draggedTextId) return "grabbing"
    if (draggedArticulationId) return "grabbing"
    if (draggedLyricId) return "grabbing"
    if (activeTool === "pen") return "crosshair"
    if (activeTool === "eraser") return 'url("/placeholder.svg?width=24&height=24"), auto'
    if (isTextMode) return "text"
    if (isLyricsMode) return "text"
    if (isHighlighterMode) return "crosshair"
    if (selectedArticulation) return "crosshair"
    if (selectedNotation && activeTool === "none" && !keyboardEnabled && !midiEnabled) return "crosshair"
    return "default"
  }, [activeTool, selectedNotation, keyboardEnabled, midiEnabled, isTextMode, isLyricsMode, isHighlighterMode, selectedArticulation, isDraggingNote, draggedTextId, draggedArticulationId, draggedLyricId])

  useEffect(() => {
    if (midiEnabled) {
      if (!navigator.requestMIDIAccess) {
        console.warn("Web MIDI API is not supported in this browser.")
        setMidiEnabled(false)
        return
      }

      const enableMidi = async () => {
        try {
          const midiAccess = await navigator.requestMIDIAccess({ sysex: false })
          const inputs: MIDIInput[] = []

          // Enhanced MIDI input setup with better event handling
          midiAccess.inputs.forEach((input) => {
            inputs.push(input)

            // Remove any existing listeners to prevent duplicates
            input.removeEventListener("midimessage", handleMidiMessage)
            input.addEventListener("midimessage", handleMidiMessage)

            // Add connection state monitoring
            input.addEventListener("statechange", (e) => {
              const target = e.target as MIDIInput
              console.log(`MIDI Input ${target.name} state: ${target.state}`)
              if (target.state === "disconnected") {
                console.warn(`MIDI device ${target.name} disconnected`)
              }
            })
          })

          setMidiInputs(inputs)
          console.log(`MIDI enabled. ${inputs.length} input device(s) connected.`)

          // Monitor for new MIDI devices
          midiAccess.addEventListener("statechange", (e) => {
            const port = e.port as MIDIInput
            if (port.type === "input") {
              if (port.state === "connected") {
                console.log(`New MIDI input connected: ${port.name}`)
                port.addEventListener("midimessage", handleMidiMessage)
                setMidiInputs((prev) => [...prev.filter((input) => input.id !== port.id), port])
              } else if (port.state === "disconnected") {
                console.log(`MIDI input disconnected: ${port.name}`)
                setMidiInputs((prev) => prev.filter((input) => input.id !== port.id))
              }
            }
          })
        } catch (error) {
          console.error("Failed to access MIDI devices:", error)
          setMidiEnabled(false)
        }
      }

      enableMidi()

      // Cleanup function
      return () => {
        midiInputs.forEach((input) => {
          input.removeEventListener("midimessage", handleMidiMessage)
        })
        // Clear all MIDI timeouts
        Object.values(midiTimeoutRef.current).forEach((timeout) => {
          clearTimeout(timeout)
        })
        midiTimeoutRef.current = {}
        // setActiveMidiNotes(new Set())
        // setLastMidiTime({})
      }
    } else {
      // Cleanup when MIDI is disabled
      midiInputs.forEach((input) => {
        input.removeEventListener("midimessage", handleMidiMessage)
      })
      Object.values(midiTimeoutRef.current).forEach((timeout) => {
        clearTimeout(timeout)
      })
      midiTimeoutRef.current = {}
      // setActiveMidiNotes(new Set())
      // setLastMidiTime({})
      setMidiInputs([])
    }
  }, [midiEnabled, handleMidiMessage, midiInputs])

  // Event listeners setup
  useEffect(() => {
    if (keyboardEnabled) {
      const handleKeyDown = (e: KeyboardEvent) => handleKeyPress(e)
      document.addEventListener("keydown", handleKeyDown, true)
      window.addEventListener("keydown", handleKeyDown, true)
      return () => {
        document.removeEventListener("keydown", handleKeyDown, true)
        window.removeEventListener("keydown", handleKeyDown, true)
      }
    }
  }, [handleKeyPress, keyboardEnabled])

  useEffect(() => {
    if (currentPage.notes.length > 0) {
      const lastNote = currentPage.notes[currentPage.notes.length - 1]
      const newPosition = lastNote.x + NOTATION_KEYBOARD_X_INCREMENT
      const lastNoteLineIndex = KEYBOARD_LINE_Y_POSITIONS.indexOf(lastNote.y)
      
      // Only update if position actually changed
      setNextNotePosition(newPosition)
      if (lastNoteLineIndex !== -1) {
        setCurrentKeyboardLineIndex(lastNoteLineIndex)
      } else {
        setCurrentKeyboardLineIndex(0)
      }
    } else {
      setNextNotePosition(INITIAL_KEYBOARD_NOTE_X_POSITION)
      setCurrentKeyboardLineIndex(0)
    }
  }, [currentPage.notes.length]) // Only depend on the length to prevent infinite loops

  useEffect(() => {
    if (keyboardEnabled) {
      document.body.focus()
      document.body.setAttribute("tabindex", "0")
      return () => {
        document.body.removeAttribute("tabindex")
      }
    }
  }, [keyboardEnabled])



  return (
    <div
      className="flex-1 bg-gray-100 overflow-auto"
      onClick={() => {
        if (keyboardEnabled && activeTool === "none") {
          document.body.focus()
        }
      }}
      tabIndex={keyboardEnabled && activeTool === "none" ? 0 : -1}
    >
      <div className="max-w-7xl mx-auto p-8">
        {/* Compact Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">{currentPage.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    <span>{currentPage.notes.length} notations</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Keyboard className="w-3 h-3" />
                    <span className={keyboardEnabled ? "text-green-600 font-medium" : "text-red-600"}>
                      Keyboard {keyboardEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    <span className={midiEnabled ? "text-green-600 font-medium" : "text-red-600"}>
                      MIDI {midiEnabled ? "ON" : "OFF"}
                    </span>
                  </div>

                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Score Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 bg-gray-600 text-white hover:bg-gray-700"
                >
                  <Settings className="w-3 h-3" />
                  Score Settings
                </button>
                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2 w-56 p-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-2 py-1 text-sm font-semibold text-gray-700">Key Signature</div>
                    <div className="my-1 h-px bg-gray-200" />
                    <div className="space-y-1">
                      {KEY_SIGNATURE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="keySignature"
                            value={option.value}
                            checked={currentPage.keySignature === option.value}
                            onChange={() => onUpdatePageSettings({ keySignature: option.value })}
                            className="form-radio h-4 w-4 text-purple-600"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>

                    <div className="my-2 h-px bg-gray-200" />
                    <div className="px-2 py-1 text-sm font-semibold text-gray-700">Time Signature</div>
                    <div className="my-1 h-px bg-gray-200" />
                    <div className="space-y-1">
                      {TIME_SIGNATURE_OPTIONS.map((option) => (
                        <label
                          key={`${option.numerator}/${option.denominator}`}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="timeSignature"
                            value={`${option.numerator}/${option.denominator}`}
                            checked={
                              currentPage.timeSignature.numerator === option.numerator &&
                              currentPage.timeSignature.denominator === option.denominator
                            }
                            onChange={() =>
                              onUpdatePageSettings({
                                timeSignature: { numerator: option.numerator, denominator: option.denominator },
                              })
                            }
                            className="form-radio h-4 w-4 text-purple-600"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>

                    <div className="my-2 h-px bg-gray-200" />
                    <div className="px-2 py-1 text-sm font-semibold text-gray-700">Tempo ({currentPage.tempo} BPM)</div>
                    <div className="my-1 h-px bg-gray-200" />
                    <div className="px-2 py-1">
                      <input
                        type="range"
                        min={40}
                        max={240}
                        step={1}
                        value={currentPage.tempo}
                        onChange={(e) => onUpdatePageSettings({ tempo: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tools Dropdown (optional, still kept) */}
              <div className="relative">
                <button
                  onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Settings className="w-3 h-3" />
                  Tools
                </button>
                {showToolsDropdown && (
                  <div className="absolute right-0 mt-2 w-48 p-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-2 py-1 text-sm font-semibold text-gray-700">Actions</div>
                    <div className="my-1 h-px bg-gray-200" />
                    <button
                      onClick={() => {
                        setShowPiano(true)
                        setShowToolsDropdown(false)
                      }}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                    >
                      <Piano className="w-3 h-3" />
                      Piano
                    </button>
                    <button
                      onClick={() => {
                        setShowKeyboardHelp(true)
                        setShowToolsDropdown(false)
                      }}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                    >
                      <Keyboard className="w-3 h-3" />
                      Key Map
                    </button>
                    <button
                      onClick={() => {
                        exportToPDF()
                        setShowToolsDropdown(false)
                      }}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                    >
                      <Download className="w-3 h-3" />
                      Export PDF
                    </button>
                    <button
                      onClick={() => {
                        handleClearAll()
                        setShowToolsDropdown(false)
                      }}
                      disabled={currentPage.notes.length === 0 && drawingLines.length === 0}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                    <button
                      onClick={() => {
                        setNextNotePosition(INITIAL_KEYBOARD_NOTE_X_POSITION)
                        setCurrentKeyboardLineIndex(0)
                        setShowToolsDropdown(false)
                      }}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Position
                    </button>


                    <div className="my-2 h-px bg-gray-200" />
                    <div className="px-2 py-1 text-sm font-semibold text-gray-700">Drawing Tools</div>
                    <div className="my-1 h-px bg-gray-200" />
                    <button
                      onClick={() => handleToolToggle("pen")}
                      className={`flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-sm ${
                        activeTool === "pen" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Pen className="w-3 h-3" />
                      Pen {activeTool === "pen" && "(Active)"}
                    </button>
                    <button
                      onClick={() => handleToolToggle("eraser")}
                      className={`flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-sm ${
                        activeTool === "eraser" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Eraser className="w-3 h-3" />
                      Eraser {activeTool === "eraser" && "(Active)"}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setKeyboardEnabled(!keyboardEnabled)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  keyboardEnabled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <Keyboard className="w-3 h-3" />
                Keyboard
              </button>
              <button
                onClick={() => setMidiEnabled(!midiEnabled)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  midiEnabled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <Music className="w-3 h-3" />
                MIDI
              </button>


              {/* Undo/Redo buttons - Stacked vertically */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    console.log('Undo clicked - canUndo:', canUndo)
                    onUndo()
                  }}
                  disabled={!canUndo}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw className="w-3 h-3" />
                  Undo
                </button>
                <button
                  onClick={() => {
                    console.log('Redo clicked - canRedo:', canRedo)
                    onRedo()
                  }}
                  disabled={!canRedo}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo (Ctrl+Y)"
                >
                  <RotateCcw className="w-3 h-3 rotate-180" />
                  Redo
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Status Banner */}
        {((keyboardEnabled || midiEnabled) && activeTool === "none") ||
          isTextMode ||
          isLyricsMode ||
          isHighlighterMode ||
          selectedArticulation ||
          (selectedNotation && !keyboardEnabled && !midiEnabled) ? (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-blue-800">
                  {keyboardEnabled && <Keyboard className="w-4 h-4" />}
                  {midiEnabled && <Music className="w-4 h-4" />}
                  {isTextMode && <Type className="w-4 h-4" />}
                  {isLyricsMode && <Music className="w-4 h-4" />}
                  {isHighlighterMode && <span className="text-lg">🎨</span>}
                  {selectedArticulation && <span className="text-lg">♪</span>}
                  {selectedNotation && !keyboardEnabled && !midiEnabled && <Music className="w-4 h-4" />}
                  <span className="font-medium">
                    {scoreMode === 'dnr' ? '[DNR Mode] ' : ''}
                    {isTextMode
                      ? "Text Mode Active - Click anywhere to add text"
                      : isLyricsMode
                        ? "Lyrics Mode Active - Click anywhere to add lyrics"
                        : isHighlighterMode
                          ? "Highlighter Mode Active - Click and drag to highlight areas"
                          : selectedArticulation
                            ? `Articulation Mode Active - ${selectedArticulation}`
                            : selectedNotation && !keyboardEnabled && !midiEnabled
                              ? "Note Placement Mode Active - Click anywhere to place notes, click on notes to delete"
                              : keyboardEnabled && midiEnabled
                                ? "Keyboard & MIDI Modes Active - Press Backspace/Delete to delete last note, click notes to select and drag"
                                : keyboardEnabled
                                  ? "Keyboard Mode Active - Press Backspace/Delete to delete last note, click notes to select and drag"
                                  : "MIDI Mode Active - Click notes to select and drag"}
                  </span>
                  <span className="text-gray-500 text-sm ml-4">
                    Measure {getCurrentMeasureInfo().measureNumber}, Beat {getCurrentMeasureInfo().beatNumber}/{getCurrentMeasureInfo().totalBeats}
                    <span className="ml-4 text-xs">
                      Ctrl+Z: Undo | Ctrl+Y: Redo
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ) : null}



        {/* Score Sheet Area */}
        <div
          className="relative bg-white shadow-xl mx-auto scoresheet-area"
          style={{
            width: `${RENDERED_SCORESHEET_WIDTH}px`,
            height: `${RENDERED_SCORESHEET_HEIGHT}px`,
            border: "1px solid #dadada",
          }}
          onClick={(e) => {
            // Deselect note when clicking on empty space
            if (e.target === e.currentTarget) {
              setSelectedNoteId(null)
            }
          }}
        >
          {/* Background Image */}
          <img
            src={scoreMode === 'dnr' ? "/images/dnr-background.jpg" : "/images/DNGLines.jpg"}
            alt={`${scoreMode === 'dnr' ? 'DNR' : 'Music'} Scoresheet Background`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />





          {/* Score Sheet Info Display with positioning */}
          <div
            className="absolute z-20 text-gray-800 font-semibold text-lg cursor-grab"
            style={{
              left: `${timeSignaturePos.x}px`,
              top: `${timeSignaturePos.y}px`,
            }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">{currentPage.timeSignature.numerator} /</span>
              <span className="text-2xl leading-none">{currentPage.timeSignature.denominator}</span>
            </div>
          </div>

          <div
            className="absolute z-20 text-gray-800 font-semibold text-sm cursor-grab"
            style={{
              left: `${keyPos.x}px`,
              top: `${keyPos.y}px`,
            }}
          >
            Key:{" "}
            {KEY_SIGNATURE_OPTIONS.find((k) => k.value === currentPage.keySignature)?.label || currentPage.keySignature}
          </div>

          <div
            className="absolute z-20 text-gray-800 font-semibold text-sm cursor-grab"
            style={{
              left: `${tempoPos.x}px`,
              top: `${tempoPos.y}px`,
            }}
          >
            Tempo: {currentPage.tempo} BPM
          </div>

          {/* Overlay for interactions */}
          <div
            className="absolute inset-0 z-10"
            onClick={activeTool === "none" ? handleImageClick : undefined}
            onMouseDown={(e) => {
              handleMouseDown(e)
              handleHighlighterMouseDown(e)
            }}
            onMouseMove={(e) => {
              handleDrawingMouseMove(e)
              handleNotePlacementMouseMove(e)
              handleNoteMouseMove(e)
              handleTextMouseMove(e)
              handleArticulationMouseMove(e)
              handleLyricMouseMove(e)
              handleHighlighterMouseMove(e)
            }}
            onMouseUp={() => {
              handleMouseUp()
              handleNoteMouseUp()
              handleTextMouseUp()
              handleArticulationMouseUp()
              handleLyricMouseUp()
              handleHighlighterMouseUp()
            }}
            onMouseLeave={() => {
              handleMouseUp()
              handleNoteMouseUp()
              handleTextMouseUp()
              handleArticulationMouseUp()
              handleLyricMouseUp()
              handleHighlighterMouseUp()
            }}
            style={{
              cursor: getCursorStyle(),
            }}
          >
            {/* Canvas for drawing */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 z-30"
              width={RENDERED_SCORESHEET_WIDTH}
              height={RENDERED_SCORESHEET_HEIGHT}
              style={{ pointerEvents: "none" }}
            />

            {/* Placed notations */}
            {currentPage.notes.map((placedNote) => (
              <div
                key={placedNote.id}
                className={`absolute group z-20 ${
                  draggedNoteId === placedNote.id ? 'cursor-grabbing' : 'cursor-pointer'
                }`}
                style={{
                  left: `${placedNote.x}px`,
                  top: `${placedNote.y}px`,
                  transform: "translateX(-50%)",
                  zIndex: draggedNoteId === placedNote.id ? 30 : 20,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  // Only start drag if not in note placement mode
                  if (!selectedNotation || activeTool !== "none" || isTextMode || isLyricsMode || selectedArticulation || keyboardEnabled || midiEnabled) {
                    handleNoteMouseDown(e, placedNote.id)
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  // In lyrics mode, select the note for lyrics
                  if (isLyricsMode) {
                    setSelectedNoteForLyrics(placedNote.id)
                    setLyricsDialogPosition({ x: placedNote.x, y: placedNote.y + 50 })
                    setShowLyricsDialog(true)
                    return
                  }
                  // Delete note on click if in note placement mode
                  if (selectedNotation && activeTool === "none" && !isTextMode && !isLyricsMode && !selectedArticulation && !keyboardEnabled && !midiEnabled) {
                    onRemoveNote(placedNote.id)
                  }
                }}
              >
                <div className="relative">
                  <img
                    src={placedNote.notation?.image || "/placeholder.svg"}
                    alt={placedNote.notation?.name || "Note"}
                    className={`w-[72px] h-[72px] object-contain transition-all duration-200 ${
                      draggedNoteId === placedNote.id 
                        ? 'drop-shadow-2xl scale-105' 
                        : selectedNoteId === placedNote.id
                          ? 'drop-shadow-lg scale-110'
                          : 'drop-shadow-md'
                    }`}
                  />
                  {/* Drag indicator - only show when selected */}
                  {selectedNoteId === placedNote.id && (
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 text-white rounded-full opacity-100 transition-all duration-300 flex items-center justify-center text-xs font-bold shadow-lg">
                      ⋮⋮
                    </div>
                  )}
                  {/* Delete button - only show when selected */}
                  {selectedNoteId === placedNote.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log("Delete button clicked for note:", placedNote.id)
                        onRemoveNote(placedNote.id)
                        setSelectedNoteId(null) // Clear selection after deletion
                      }}
                      className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full opacity-100 transition-all duration-300 flex items-center justify-center text-sm font-bold shadow-lg hover:bg-red-600"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Text elements */}
            {textElements.map((textElement) => (
              <div
                key={textElement.id}
                className="absolute group z-20 select-none"
                style={{
                  left: `${textElement.x}px`,
                  top: `${textElement.y}px`,
                  fontSize: `${textElement.fontSize}px`,
                  fontWeight: textElement.bold ? "bold" : "normal",
                  fontStyle: textElement.italic ? "italic" : "normal",
                  textDecoration: textElement.underline ? "underline" : "none",
                  cursor: draggedTextId === textElement.id ? "grabbing" : "grab",
                }}
                onMouseDown={(e) => handleTextMouseDown(e, textElement.id)}
                onMouseMove={handleTextMouseMove}
                onMouseUp={handleTextMouseUp}
              >
                <div className="relative">
                  <span className="text-gray-800 pointer-events-none">{textElement.text}</span>
                  <button
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveTextElement(textElement.id)
                    }}
                    title="Delete text"
                    aria-label="Delete text"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-xs font-bold shadow-lg hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}

            {/* Lyrics elements */}
            {lyricElements.map((lyricElement) => (
              <div
                key={lyricElement.id}
                className="absolute group z-20 select-none"
                style={{
                  left: `${lyricElement.x}px`,
                  top: `${lyricElement.y}px`,
                  fontSize: `${lyricElement.fontSize}px`,
                  cursor: draggedLyricId === lyricElement.id ? "grabbing" : "grab",
                  zIndex: draggedLyricId === lyricElement.id ? 30 : 20,
                }}
                onMouseDown={(e) => handleLyricMouseDown(e, lyricElement.id)}
                onClick={(e) => {
                  e.stopPropagation()
                  // Select the note this lyric belongs to
                  const noteIndex = currentPage.notes.findIndex(note => note.id === lyricElement.noteId)
                  if (noteIndex !== -1) {
                    setSelectedNoteId(lyricElement.noteId)
                    setCursorToNote(noteIndex)
                  }
                }}
              >
                <div className="relative">
                  <span className="text-blue-600 font-medium pointer-events-none">{lyricElement.text}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveLyric?.(lyricElement.id)
                    }}
                    title="Delete lyrics"
                    aria-label="Delete lyrics"
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-xs font-bold shadow-lg hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}

            {/* Articulation elements */}
            {articulationElements.map((articulation) => (
              <div
                key={articulation.id}
                className="absolute group z-20 select-none"
                style={{
                  left: `${articulation.x}px`,
                  top: `${articulation.y}px`,
                  transform: "translateX(-50%)",
                  cursor: draggedArticulationId === articulation.id ? "grabbing" : "grab",
                }}
                onMouseDown={(e) => handleArticulationMouseDown(e, articulation.id)}
                onMouseMove={handleArticulationMouseMove}
                onMouseUp={handleArticulationMouseUp}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <div className="relative">
                  {articulation.isExtensible ? (
                    <div 
                      className="flex items-center justify-center"
                      style={{ height: articulation.height || 100 }}
                    >
                      <span 
                        className="text-gray-800 font-light drop-shadow-md"
                        style={{ 
                          fontSize: `${articulation.height || 100}px`,
                          lineHeight: '1',
                          display: 'block',
                          letterSpacing: articulation.symbol === '||' ? '-0.1em' : '0'
                        }}
                      >
                        {articulation.symbol}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl text-gray-800 font-bold drop-shadow-md">{articulation.symbol}</span>
                  )}
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveArticulation(articulation.id)
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-xs font-bold shadow-lg hover:bg-red-600"
                  >
                    &times;
                  </button>
                  
                  {/* Resize handle for extensible articulations */}
                  {articulation.isExtensible && (
                    <div
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-blue-500 rounded cursor-ns-resize opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600"
                      onMouseDown={(e) => handleArticulationResizeMouseDown(e, articulation.id)}
                      title="Resize bar line"
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Next note position indicator */}
            {(keyboardEnabled || midiEnabled) && activeTool === "none" && !isTextMode && !isLyricsMode && !selectedArticulation && (
              <div
                className="absolute w-px h-6 bg-blue-400 opacity-100 animate-pulse z-20 translate-y-1/2"
                style={{
                  left: `${nextNotePosition}px`,
                  top: `${currentKeyboardLineY}px`,
                }}
              />
            )}

            {/* Mouse cursor indicator for note placement */}
            {selectedNotation && activeTool === "none" && !isTextMode && !selectedArticulation && !keyboardEnabled && !midiEnabled && (
              <div
                className="absolute w-8 h-8 bg-blue-500 bg-opacity-30 border-2 border-blue-500 rounded-full z-20 pointer-events-none"
                style={{
                  left: `${nextNotePosition - 16}px`,
                  top: `${currentKeyboardLineY - 16}px`,
                }}
              />
            )}

            {/* Blinking cursor indicator */}
            {cursorPosition.isVisible && (
              <div
                className={`absolute w-1 h-8 bg-red-500 z-30 pointer-events-none transition-opacity duration-100 ${
                  isBlinking ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: `${cursorPosition.x}px`,
                  top: `${cursorPosition.y - 16}px`,
                }}
              />
            )}

            {/* Note preview at cursor position */}
            {selectedNotation && activeTool === "none" && !isTextMode && !isLyricsMode && !selectedArticulation && !keyboardEnabled && !midiEnabled && (
              <div
                className="absolute z-20 pointer-events-none opacity-50"
                style={{
                  left: `${nextNotePosition}px`,
                  top: `${currentKeyboardLineY}px`,
                  transform: "translateX(-50%)",
                }}
              >
                <img
                  src={selectedNotation.image || "/placeholder.svg"}
                  alt={selectedNotation.name || "Note"}
                  className="w-[72px] h-[72px] object-contain"
                />
              </div>
            )}

            {/* Highlighter elements */}
            {highlighterElements.map((highlighter) => (
              <div
                key={highlighter.id}
                className="absolute z-15 pointer-events-none"
                style={{
                  left: `${highlighter.x}px`,
                  top: `${highlighter.y}px`,
                  width: `${highlighter.width}px`,
                  height: `${highlighter.height}px`,
                  backgroundColor: highlighter.color,
                  opacity: highlighter.opacity,
                  borderRadius: '4px',
                }}
              />
            ))}

            {/* Current highlight preview */}
            {isDrawingHighlight && currentHighlight.width > 0 && currentHighlight.height > 0 && (
              <div
                className="absolute z-25 pointer-events-none border-2 border-dashed"
                style={{
                  left: `${currentHighlight.x}px`,
                  top: `${currentHighlight.y}px`,
                  width: `${currentHighlight.width}px`,
                  height: `${currentHighlight.height}px`,
                  borderColor: selectedHighlighterColor,
                  backgroundColor: `${selectedHighlighterColor}20`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Text Dialog Modal */}
      {showTextDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Add Text
                </h2>
                <button
                  onClick={() => setShowTextDialog(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
                  <textarea
                    value={newTextContent}
                    onChange={(e) => setNewTextContent(e.target.value)}
                    placeholder="Enter your text here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size: {newTextSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={newTextSize}
                    onChange={(e) => setNewTextSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formatting</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewTextBold(!newTextBold)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-200 ${
                        newTextBold
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Bold className="w-4 h-4" />
                      Bold
                    </button>
                    <button
                      onClick={() => setNewTextItalic(!newTextItalic)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-200 ${
                        newTextItalic
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Italic className="w-4 h-4" />
                      Italic
                    </button>
                    <button
                      onClick={() => setNewTextUnderline(!newTextUnderline)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-200 ${
                        newTextUnderline
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Underline className="w-4 h-4" />
                      Underline
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddText}
                    disabled={!newTextContent.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Add Text
                  </button>
                  <button
                    onClick={() => setShowTextDialog(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lyrics Dialog Modal */}
      {showLyricsDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Add Lyrics
                </h2>
                <button
                  onClick={() => setShowLyricsDialog(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lyrics Text</label>
                  <input
                    type="text"
                    value={newLyricsContent}
                    onChange={(e) => setNewLyricsContent(e.target.value)}
                    placeholder="Enter lyrics..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  {selectedNoteForLyrics ? (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Lyrics will be attached to the selected note
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Note: This lyric will be placed at the clicked position. To attach to a specific note, click on a note first.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddLyrics}
                    disabled={!newLyricsContent.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Add Lyrics
                  </button>
                  <button
                    onClick={() => setShowLyricsDialog(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[80vh] overflow-auto border border-gray-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Enhanced Keyboard & MIDI Mapping</h2>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                {notations.map((notation) => (
                  <div key={notation.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <kbd
                        className={`px-2 py-1 rounded text-sm font-mono ${
                          notation.alphabet >= "A" && notation.alphabet <= "S"
                            ? "bg-purple-800 text-white"
                            : "bg-gray-800 text-white"
                        }`}
                      >
                        {notation.alphabet}
                      </kbd>
                      <img
                        src={notation.image || "/placeholder.svg"}
                        alt={notation.name}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      <div className="font-medium truncate">{notation.name}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Press any mapped key to place the corresponding notation on the sheet</li>
                  <li>
                    • <kbd className="px-1 py-0.5 bg-gray-800 text-white rounded font-mono text-xs">a-z</kbd> keys place
                    lowercase notations (26 keys)
                  </li>
                  <li>
                    • <kbd className="px-1 py-0.5 bg-purple-800 text-white rounded font-mono text-xs">A-S</kbd> keys
                    place uppercase notations (19 keys)
                  </li>
                  <li>• Total of 45 different notations available via keyboard/MIDI</li>
                  <li>• Notations are placed automatically from left to right with line wrapping</li>
                  <li>• Use "Reset Position" to start placing notations from the beginning again</li>
                  <li>
                    • Press <kbd className="px-1 py-0.5 bg-gray-800 text-white rounded font-mono text-xs">Enter</kbd> to
                    move to the next line
                  </li>
                  <li>
                    • Press{" "}
                    <kbd className="px-1 py-0.5 bg-gray-800 text-white rounded font-mono text-xs">Backspace</kbd> to
                    delete the last placed notation
                  </li>
                </ul>
                <h3 className="font-semibold text-blue-900 mt-4 mb-2">Enhanced MIDI Mapping (a-z then A-S):</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h4 className="font-medium mb-1">a-z keys (MIDI notes 48-73):</h4>
                    <ul className="space-y-1">
                      {Object.entries(midiNoteToNotationMap)
                        .slice(0, 26)
                        .map(([midiNote, alphabetKey]) => {
                          const notation = getNotationByKey(alphabetKey)
                          return (
                            <li key={midiNote} className="text-xs">
                              • MIDI {midiNote} →{" "}
                              <kbd className="px-1 py-0.5 bg-gray-800 text-white rounded font-mono">{alphabetKey}</kbd>{" "}
                              ({notation?.name || "Unknown"})
                            </li>
                          )
                        })}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">A-S keys (MIDI notes 74-92):</h4>
                    <ul className="space-y-1">
                      {Object.entries(midiNoteToNotationMap)
                        .slice(26)
                        .map(([midiNote, alphabetKey]) => {
                          const notation = getNotationByKey(alphabetKey)
                          return (
                            <li key={midiNote} className="text-xs">
                              • MIDI {midiNote} →{" "}
                              <kbd className="px-1 py-0.5 bg-purple-800 text-white rounded font-mono">
                                {alphabetKey}
                              </kbd>{" "}
                              ({notation?.name || "Unknown"})
                            </li>
                          )
                        })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PianoComponent isOpen={showPiano} onClose={() => setShowPiano(false)} />
    </div>
  )
}

export default ScoreSheet
