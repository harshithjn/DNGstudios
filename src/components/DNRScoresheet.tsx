"use client"
import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  Trash2,
  Music,
  Keyboard,
  RotateCcw,
  Download,
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
import type { LayoutSettings } from "./LayoutSettings"
import PianoComponent from "./Piano"
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

interface DNRScoresheetProps {
  selectedNotation: Notation | null
  currentPage: ScorePage
  onAddNote: (note: PlacedNotation) => void
  onRemoveNote: (noteId: string) => void
  onUpdateNote: (noteId: string, updates: Partial<PlacedNotation>) => void
  onUpdatePageSettings?: (settings: Partial<ScorePage>) => void
  textElements: TextElement[]
  onAddTextElement?: (textElement: TextElement) => void
  onRemoveTextElement: (id: string) => void
  onUpdateTextElement?: (id: string, updates: Partial<TextElement>) => void
  articulationElements: ArticulationElement[]
  onAddArticulation?: (articulation: ArticulationElement) => void
  onRemoveArticulation: (id: string) => void
  onUpdateArticulation?: (id: string, updates: Partial<ArticulationElement>) => void
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
  onRemoveHighlighter?: (id: string) => void
  onUpdateHighlighter?: (id: string, updates: Partial<HighlighterElement>) => void
  layoutSettings?: LayoutSettings
  onUpdateLayoutSettings?: (settings: Partial<LayoutSettings>) => void
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  onAddPage?: () => void
}

const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123
const INITIAL_KEYBOARD_NOTE_X_POSITION = 200
const NOTATION_VISUAL_WIDTH = 60
const NOTATION_KEYBOARD_X_INCREMENT = 70
const RENDERED_SCORESHEET_WIDTH = A4_WIDTH_PX * 1.3
const RENDERED_SCORESHEET_HEIGHT = A4_HEIGHT_PX * 1.3

// Improved line spacing for better PDF export
const KEYBOARD_LINE_Y_POSITIONS = [250, 380, 510, 640, 770, 900, 1030, 1160, 1290, 1420, 1550]

const NOTE_BOUNDARY_LEFT = INITIAL_KEYBOARD_NOTE_X_POSITION
const NOTE_BOUNDARY_RIGHT = 1200

// Bar line constants
const BAR_LINE_COLOR = '#666'
const BAR_LINE_OPACITY = 0.6





const midiNoteToNotationMap: { [key: number]: string } = {
  // Major notes only - optimized for better PDF export
  // a, d, g, j, m, p (major white notes)
  48: "a", // Maguru White
  51: "d", // Guru White
  54: "g", // Bindu White
  57: "j", // Vasu White
  60: "m", // Praya White
  63: "p", // Danta White
  
  // Time and rhythm notations
  66: "s", // 2 Times Left
  67: "t", // 2 Times Right
  68: "u", // 3 Times Left
  69: "v", // 3 Times Right
  70: "w", // 4 Times Left
  71: "x", // 4 Times Right
  
  // Special notations
  72: "y", // Daro
  73: "z", // Enjo
  
  // Uppercase major notes
  74: "A", // Lower Octave 1
  75: "B", // Lower Octave 2
  76: "C", // Middle Octave
  77: "D", // Higher Octave 1
  78: "E", // Higher Octave 2
  
  // Special major notations
  79: "F", // Neredani
  80: "G", // Dumbidani
  81: "H", // Pisudani
  82: "I", // Meludhani
  83: "J", // Nakalu
  84: "K", // Bhamini
  85: "L", // Hindani
  86: "M", // Mundani
  87: "N", // Daneottu
  88: "O", // Chimma
  89: "P", // Najakath
  90: "Q", // Cut Nit
  91: "R", // Usha
  92: "S", // Nisha
}

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

const DNRScoresheet: React.FC<DNRScoresheetProps> = ({
  selectedNotation,
  currentPage,
  onAddNote,
  onRemoveNote,
  onUpdateNote,
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
  canUndo,
  canRedo,
  onUndo,
  onRedo,
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
  const [isStemMode, setIsStemMode] = useState(false)
  const [selectedStem, setSelectedStem] = useState<string | null>(null)
  const [showBarLines, setShowBarLines] = useState(false)
  const [barLineSpacing, setBarLineSpacing] = useState(200)

  // Generate bar lines function
  const generateBarLines = useCallback(() => {
    if (!showBarLines) return []
    
    const lines = []
    for (let x = NOTE_BOUNDARY_LEFT; x < NOTE_BOUNDARY_RIGHT; x += barLineSpacing) {
      lines.push({
        id: `bar-line-${x}`,
        x: x,
        y: KEYBOARD_LINE_Y_POSITIONS[0] - 50,
        height: KEYBOARD_LINE_Y_POSITIONS[KEYBOARD_LINE_Y_POSITIONS.length - 1] + 50,
        width: 1
      })
    }
    return lines
  }, [showBarLines, barLineSpacing])


  // Drag state for notes
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const [noteDragOffset, setNoteDragOffset] = useState({ x: 0, y: 0 })
  const [isDraggingNote, setIsDraggingNote] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  // Score info positions
  const [timeSignaturePos] = useState(
    currentPage.timeSignaturePosition || DEFAULT_TIME_SIGNATURE_POS,
  )
  const [keyPos] = useState(currentPage.keySignaturePosition || DEFAULT_KEY_POS)
  const [tempoPos] = useState(currentPage.tempoPosition || DEFAULT_TEMPO_POS)

  // Drag state for text elements
  const [draggedTextId, setDraggedTextId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Drag state for articulation elements
  const [draggedArticulationId, setDraggedArticulationId] = useState<string | null>(null)
  const [articulationDragOffset, setArticulationDragOffset] = useState({ x: 0, y: 0 })
  const [resizingArticulationId, setResizingArticulationId] = useState<string | null>(null)
  const [resizeStartY, setResizeStartY] = useState(0)
  const [resizeStartHeight, setResizeStartHeight] = useState(0)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  
  



  const midiTimeoutRef = useRef<{ [key: number]: number }>({})

  // Initialize cursor navigation
  const {
    cursorPosition,
    isBlinking
  } = useCursorNavigation(currentPage.notes)

  // Calculate current keyboard line Y position
  const currentKeyboardLineY = KEYBOARD_LINE_Y_POSITIONS[currentKeyboardLineIndex]



  // Add drag handlers for text elements
  const handleTextMouseDown = useCallback(
    (e: React.MouseEvent, textId: string) => {
      e.preventDefault()
      e.stopPropagation()
      const textElement = textElements.find((t) => t.id === textId)
      if (!textElement || !onUpdateTextElement) return

      setDraggedTextId(textId)
      setDragOffset({
        x: e.clientX - textElement.x,
        y: e.clientY - textElement.y,
      })
    },
    [textElements, onUpdateTextElement],
  )

  const handleTextMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedTextId || !onUpdateTextElement) return
      e.preventDefault()

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      try {
        onUpdateTextElement(draggedTextId, { x: newX, y: newY })
      } catch (error) {
        console.warn('onUpdateTextElement not available:', error)
      }
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
      if (!art || !onUpdateArticulation) return

      setDraggedArticulationId(articulationId)
      setArticulationDragOffset({
        x: e.clientX - art.x,
        y: e.clientY - art.y,
      })
    },
    [articulationElements, onUpdateArticulation],
  )

  const handleArticulationResizeMouseDown = useCallback(
    (e: React.MouseEvent, articulationId: string) => {
      e.preventDefault()
      e.stopPropagation()
      const art = articulationElements.find((a) => a.id === articulationId)
      if (!art || !onUpdateArticulation) return

      setResizingArticulationId(articulationId)
      setResizeStartY(e.clientY)
      setResizeStartHeight(art.height || 50)
    },
    [articulationElements, onUpdateArticulation],
  )

  const handleArticulationWidthResizeMouseDown = useCallback(
    (e: React.MouseEvent, articulationId: string) => {
      e.preventDefault()
      e.stopPropagation()
      const art = articulationElements.find((a) => a.id === articulationId)
      if (!art || !onUpdateArticulation) return

      setResizingArticulationId(articulationId)
      setResizeStartX(e.clientX)
      setResizeStartWidth(art.width || 100)
    },
    [articulationElements, onUpdateArticulation],
  )


  const handleArticulationMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if ((!draggedArticulationId && !resizingArticulationId) || !onUpdateArticulation) return
      e.preventDefault()
      
      if (draggedArticulationId) {
        const newX = e.clientX - articulationDragOffset.x
        const newY = e.clientY - articulationDragOffset.y
        try {
          onUpdateArticulation(draggedArticulationId, { x: newX, y: newY })
        } catch (error) {
          console.warn('onUpdateArticulation not available:', error)
        }
      }
      
      if (resizingArticulationId) {
        const art = articulationElements.find((a) => a.id === resizingArticulationId)
        if (art) {
          if (art.type === 'tie' && resizeStartX !== 0) {
            // Width resize for ties
            const deltaX = e.clientX - resizeStartX
            const newWidth = Math.max(50, resizeStartWidth + deltaX)
            try {
              onUpdateArticulation(resizingArticulationId, { width: newWidth })
            } catch (error) {
              console.warn('onUpdateArticulation not available:', error)
            }
          } else {
            // Height resize for other extensible elements
            const deltaY = e.clientY - resizeStartY
            const newHeight = Math.max(20, resizeStartHeight + deltaY)
            try {
              onUpdateArticulation(resizingArticulationId, { height: newHeight })
            } catch (error) {
              console.warn('onUpdateArticulation not available:', error)
            }
          }
        }
      }
      
    },
    [draggedArticulationId, articulationDragOffset, onUpdateArticulation, resizingArticulationId, resizeStartY, resizeStartHeight, resizeStartX, resizeStartWidth, articulationElements],
  )

  const handleArticulationMouseUp = useCallback(() => {
    setDraggedArticulationId(null)
    setArticulationDragOffset({ x: 0, y: 0 })
    setResizingArticulationId(null)
    setResizeStartY(0)
    setResizeStartHeight(0)
    setResizeStartX(0)
    setResizeStartWidth(0)
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

  // Optimized function to delete the last note
  const deleteLastNote = useCallback(() => {
    console.log("deleteLastNote called, notes length:", currentPage.notes.length)
    console.log("Current page notes:", currentPage.notes)
    if (currentPage.notes.length > 0) {
      const lastNote = currentPage.notes[currentPage.notes.length - 1]
      console.log("Deleting last note:", lastNote)
      console.log("Note ID:", lastNote.id, "Type:", typeof lastNote.id)
      console.log("Calling onRemoveNote with ID:", lastNote.id)
      onRemoveNote(lastNote.id)
    } else {
      console.log("No notes to delete")
    }
  }, [currentPage.notes, onRemoveNote])

  const placeNotation = useCallback(
    (mappedNotation: Notation, customX?: number, customY?: number) => {
      let finalX = customX ?? nextNotePosition
      let finalY = customY ?? currentKeyboardLineY

      // If custom position is provided, snap to nearest keyboard line
      if (customX !== undefined && customY !== undefined) {
        // Find the closest keyboard line Y position
        const closestLineIndex = KEYBOARD_LINE_Y_POSITIONS.reduce((closest, current, index) => {
          const distance = Math.abs(current - customY)
          const closestDistance = Math.abs(KEYBOARD_LINE_Y_POSITIONS[closest] - customY)
          return distance < closestDistance ? index : closest
        }, 0)
        
        finalY = KEYBOARD_LINE_Y_POSITIONS[closestLineIndex]
        setCurrentKeyboardLineIndex(closestLineIndex)
        
        const newNote: PlacedNotation = {
          id: Date.now().toString(),
          notation: mappedNotation,
          x: finalX,
          y: finalY,
          staveIndex: 0,
          octave: 4,
          flipped: false,
        }
        onAddNote(newNote)
        
        // Update cursor position to after the placed note
        setNextNotePosition(finalX + NOTATION_KEYBOARD_X_INCREMENT)
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

      // Ensure proper alignment to grid for better PDF export
      finalX = Math.round(finalX / 10) * 10
      // Always use exact keyboard line Y position for consistent placement
      finalY = KEYBOARD_LINE_Y_POSITIONS[currentKeyboardLineIndex]

      const newNote: PlacedNotation = {
        id: Date.now().toString(),
        notation: mappedNotation,
        x: finalX,
        y: finalY,
        staveIndex: 0,
        octave: 4,
        flipped: false
      }
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
      if (
        !keyboardEnabled ||
        showSettingsDropdown ||
        showKeyboardHelp ||
        showToolsDropdown ||
        showTextDialog
      )
        return
      const target = event.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return
      }

      const key = event.key
      
      // Handle Escape key to clear note selection
      if (key === "Escape") {
        event.preventDefault()
        setSelectedNoteId(null)
        return
      }
      
      const mappedNotation = getNotationByKey(key)





      if (key === "Backspace" || key === "Delete") {
        event.preventDefault()
        event.stopPropagation()
        console.log("Backspace/Delete key pressed - calling deleteLastNote")
        console.log("Current notes before deletion:", currentPage.notes.length)
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
        placeNotation(mappedNotation)
      }
    },
    [
      keyboardEnabled,
      showSettingsDropdown,
      showKeyboardHelp,
      showToolsDropdown,
      showTextDialog,
      deleteLastNote,
      placeNotation,
      setNextNotePosition,
      setCurrentKeyboardLineIndex,
    ],
  )

  const handleMidiMessage = useCallback(
    (event: MIDIMessageEvent) => {
      if (!midiEnabled || showSettingsDropdown || showKeyboardHelp || showToolsDropdown) return

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
    [midiEnabled, showSettingsDropdown, showKeyboardHelp, showToolsDropdown, placeNotation],
  )

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (isTextMode) {
      setTextDialogPosition({ x, y })
      setShowTextDialog(true)
      return
    }

    if (isStemMode && selectedStem) {
      // In stem mode, place the selected stem image
      if (onAddArticulation) {
        const newStemElement: ArticulationElement = {
          id: Date.now().toString(),
          type: 'stem',
          name: selectedStem,
          symbol: selectedStem,
          x: Math.max(20, Math.min(x, rect.width - 20)),
          y: Math.max(20, Math.min(y, rect.height - 20)),
          height: 100, // Default height for stem images
          isExtensible: true,
        }
        try {
          onAddArticulation(newStemElement)
        } catch (error) {
          console.warn('onAddArticulation not available:', error)
        }
      }
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
        { id: "tie", name: "Tie", symbol: "⌒", isExtensible: true },
        { id: "black-dot", name: "Black Dot", symbol: "●" },
        { id: "outline-dot", name: "Outline Dot", symbol: "○" },
      ]

      const barLines: Array<{ id: string; name: string; symbol: string; isExtensible?: boolean }> = [
        { id: "bar-line", name: "Bar Line", symbol: "|", isExtensible: true },
        { id: "double-bar-line", name: "Double Bar Line", symbol: "||", isExtensible: true },
      ]

      const articulation = articulations.find((a) => a.id === selectedArticulation) || 
                          barLines.find((a) => a.id === selectedArticulation)
      if (articulation && onAddArticulation) {
        const newArticulation: ArticulationElement = {
          id: Date.now().toString(),
          type: articulation.id,
          name: articulation.name,
          symbol: articulation.symbol,
          x: Math.max(20, Math.min(x, rect.width - 20)),
          y: Math.max(20, Math.min(y, rect.height - 20)),
          height: articulation.isExtensible ? 50 : undefined, // Default height for extensible elements
          width: articulation.isExtensible ? 100 : undefined, // Default width for extensible elements
          isExtensible: articulation.isExtensible || false,
        }
        try {
          onAddArticulation(newArticulation)
        } catch (error) {
          console.warn('onAddArticulation not available:', error)
        }
      }
      return
    }

    if (!selectedNotation) {
      return
    }

    // Use the improved placeNotation function with custom position
    placeNotation(selectedNotation, x, y)
  }

  const handleAddText = () => {
    if (!newTextContent.trim() || !onAddTextElement) return

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

    try {
      onAddTextElement(newTextElement)
      setShowTextDialog(false)
      setNewTextContent("")
      setNewTextSize(16)
      setNewTextBold(false)
      setNewTextItalic(false)
      setNewTextUnderline(false)
    } catch (error) {
      console.warn('onAddTextElement not available:', error)
    }
  }











  const handleClearAll = () => {
    // Clear all notes
    currentPage.notes.forEach(note => onRemoveNote(note.id))
  }

  const exportToPDF = async () => {
    const scoresheetElement = document.querySelector(".dnr-scoresheet-area") as HTMLElement
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
      pdf.save(`${currentPage.title}_DNR.pdf`)
    } catch (error) {
      console.error("Error exporting to PDF:", error)
    }
  }



  const getCursorStyle = useCallback(() => {
    if (isDraggingNote) return "grabbing"
    if (draggedTextId) return "grabbing"
    if (draggedArticulationId) return "grabbing"
    if (isTextMode) return "text"
    if (selectedArticulation) return "crosshair"
    if (selectedNotation && !keyboardEnabled && !midiEnabled) return "crosshair"
    return "default"
  }, [selectedNotation, keyboardEnabled, midiEnabled, isTextMode, selectedArticulation, isDraggingNote, draggedTextId, draggedArticulationId])

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
  }, [currentPage.notes]) // Depend on the entire notes array for proper updates

  useEffect(() => {
    if (keyboardEnabled) {
      document.body.focus()
      document.body.setAttribute("tabindex", "0")
      return () => {
        document.body.removeAttribute("tabindex")
      }
    }
  }, [keyboardEnabled])

  // Handle background click to clear note selection
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only clear selection if clicking on the background, not on notes or other elements
    if (e.target === e.currentTarget) {
      setSelectedNoteId(null)
    }
  }

  return (
    <div className="flex-1 bg-gray-100 overflow-auto" onClick={handleBackgroundClick}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Compact Header */}
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 mb-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{currentPage.title} - DNR Mode</h2>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    <span>{currentPage.notes.length} notations</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <div className="flex items-center gap-1">
                    <Keyboard className="w-3 h-3" />
                    <span className={keyboardEnabled ? "text-green-400 font-medium" : "text-red-400"}>
                      Keyboard {keyboardEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <div className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    <span className={midiEnabled ? "text-green-400 font-medium" : "text-red-400"}>
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
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 bg-slate-700 text-white hover:bg-slate-600"
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
                            onChange={() => onUpdatePageSettings?.({ keySignature: option.value })}
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
                              onUpdatePageSettings?.({
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
                        onChange={(e) => onUpdatePageSettings?.({ tempo: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tools Dropdown */}
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
                      disabled={currentPage.notes.length === 0}
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
                    <button
                      onClick={() => {
                        setIsStemMode(!isStemMode)
                        setShowToolsDropdown(false)
                        // Reset other modes
                        setSelectedStem(null)
                      }}
                      className={`flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-sm ${
                        isStemMode 
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Music className="w-3 h-3" />
                      Stem
                    </button>
                    <button
                      onClick={() => {
                        // Flip all placed notes horizontally
                        currentPage.notes.forEach(note => {
                          const flippedX = RENDERED_SCORESHEET_WIDTH - note.x
                          onUpdateNote(note.id, { x: flippedX })
                        })
                        setShowToolsDropdown(false)
                      }}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.3 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Flip Notes
                    </button>
                    <button
                      onClick={() => {
                        // Add measure/bar line at current position
                        const newBarLine: ArticulationElement = {
                          id: Date.now().toString(),
                          type: 'bar-line',
                          name: 'Measure Line',
                          symbol: '|',
                          x: nextNotePosition,
                          y: currentKeyboardLineY - 50,
                          height: 50,
                          isExtensible: true,
                        }
                        onAddArticulation?.(newBarLine)
                        setShowToolsDropdown(false)
                      }}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                    >
                      <Music className="w-3 h-3" />
                      Add Measure Line
                    </button>
                    <button
                      onClick={() => {
                        // Add double bar line
                        const newDoubleBarLine: ArticulationElement = {
                          id: Date.now().toString(),
                          type: 'double-bar-line',
                          name: 'Double Bar Line',
                          symbol: '||',
                          x: nextNotePosition,
                          y: currentKeyboardLineY - 50,
                          height: 50,
                          isExtensible: true,
                        }
                        onAddArticulation?.(newDoubleBarLine)
                        setShowToolsDropdown(false)
                      }}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                    >
                      <Music className="w-3 h-3" />
                      Add Double Bar Line
                    </button>

                    <div className="my-2 h-px bg-gray-200" />
                    <div className="px-2 py-1 text-sm font-semibold text-gray-700">Music Notation</div>
                    <div className="my-1 h-px bg-gray-200" />
                    <button
                      onClick={() => {
                        setShowBarLines(!showBarLines)
                        setShowToolsDropdown(false)
                      }}
                      className={`flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-sm ${
                        showBarLines ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-3 h-3 flex items-center justify-center">
                        <div className="w-0.5 h-3 bg-current"></div>
                      </div>
                      Bar Lines {showBarLines ? "(On)" : "(Off)"}
                    </button>
                    <div className="px-2 py-1 text-xs text-gray-500">
                      Bar Line Spacing: {barLineSpacing}px
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="400"
                      value={barLineSpacing}
                      onChange={(e) => setBarLineSpacing(Number(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />

                    <div className="my-2 h-px bg-gray-200" />
                    <div className="px-2 py-1 text-sm font-semibold text-gray-700">Drawing Tools</div>
                    <div className="my-1 h-px bg-gray-200" />

                  </div>
                )}
              </div>

              <button
                onClick={() => setKeyboardEnabled(!keyboardEnabled)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  keyboardEnabled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-slate-700 text-white hover:bg-slate-600"
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
                    : "bg-slate-700 text-white hover:bg-slate-600"
                }`}
              >
                <Music className="w-3 h-3" />
                MIDI
              </button>
              {/* Undo/Redo buttons - Stacked vertically */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw className="w-3 h-3" />
                  Undo
                </button>
                <button
                  onClick={onRedo}
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


        {/* DNR Score Sheet Area */}
        <div
          className="relative bg-white shadow-xl mx-auto dnr-scoresheet-area"
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
            if (keyboardEnabled) {
              document.body.focus()
            }
          }}
          tabIndex={keyboardEnabled ? 0 : -1}
        >
          {/* DNR Background Image */}
          <img
            src="/images/dnr-background.jpg"
            alt="DNR Scoresheet Background"
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
            onClick={handleImageClick}
            
            onMouseMove={(e) => {
              handleNoteMouseMove(e)
              if (onUpdateTextElement) handleTextMouseMove(e)
              if (onUpdateArticulation) handleArticulationMouseMove(e)
            }}
            onMouseUp={() => {
              handleNoteMouseUp()
              handleTextMouseUp()
              handleArticulationMouseUp()
            }}
            onMouseLeave={() => {
              handleNoteMouseUp()
              handleTextMouseUp()
              handleArticulationMouseUp()
            }}
            style={{
              cursor: getCursorStyle(),
            }}
          >


            {/* Bar Lines */}
            {showBarLines && generateBarLines().map((barLine, index) => (
              <div
                key={`bar-line-${index}`}
                className="absolute z-10 pointer-events-none"
                style={{
                  left: `${barLine.x}px`,
                  top: `${barLine.y}px`,
                  width: `${barLine.width}px`,
                  height: `${barLine.height}px`,
                  backgroundColor: BAR_LINE_COLOR,
                  opacity: BAR_LINE_OPACITY,
                }}
              />
            ))}

            {/* Placed notations (images) */}
            {currentPage.notes.map((placedNote) => (
              <div
                key={placedNote.id}
                className={`absolute group z-20 ${
                  draggedNoteId === placedNote.id ? 'cursor-grabbing' : 'cursor-pointer'
                }`}
                style={{
                  left: `${placedNote.x}px`,
                  top: `${placedNote.y}px`,
                  transform: "translate(-50%, -50%)",
                  zIndex: draggedNoteId === placedNote.id ? 30 : 20,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  // Only start drag if not in note placement mode
                  if (!selectedNotation || isTextMode || selectedArticulation || keyboardEnabled || midiEnabled) {
                    handleNoteMouseDown(e, placedNote.id)
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  // Delete note on click if in note placement mode
                  if (selectedNotation && !isTextMode && !selectedArticulation && !keyboardEnabled && !midiEnabled) {
                    onRemoveNote(placedNote.id)
                  }
                }}
              >
                <div className="relative">
                  <img
                    src={placedNote.notation?.image || "/placeholder.svg"}
                    alt={placedNote.notation?.name || "Image"}
                    className={`w-[80px] h-[80px] object-contain transition-all duration-200 ${
                      draggedNoteId === placedNote.id 
                        ? 'drop-shadow-2xl scale-105' 
                        : selectedNoteId === placedNote.id
                          ? 'drop-shadow-lg scale-110'
                          : 'drop-shadow-md'
                    }`}
                    style={{
                      imageRendering: '-webkit-optimize-contrast',
                      transform: placedNote.flipped ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />

                  {/* Drag indicator - only show when selected */}
                  {selectedNoteId === placedNote.id && (
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 text-white rounded-full opacity-100 transition-all duration-300 flex items-center justify-center text-xs font-bold shadow-lg">
                      ⋮⋮
                    </div>
                  )}

                  {/* Action buttons - only show when selected */}
                  {selectedNoteId === placedNote.id && (
                    <div className="absolute -top-3 -right-3 flex gap-1">
                      {/* Flip button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log("Flip button clicked for note:", placedNote.id)
                          onUpdateNote(placedNote.id, { flipped: !placedNote.flipped })
                        }}
                        className="w-6 h-6 bg-blue-500 text-white rounded-full opacity-100 transition-all duration-300 flex items-center justify-center text-sm font-bold shadow-lg hover:bg-blue-600"
                        title="Flip note"
                      >
                        ↻
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log("Delete button clicked for note:", placedNote.id)
                          onRemoveNote(placedNote.id)
                          setSelectedNoteId(null) // Clear selection after deletion
                        }}
                        className="w-6 h-6 bg-red-500 text-white rounded-full opacity-100 transition-all duration-300 flex items-center justify-center text-sm font-bold shadow-lg hover:bg-red-600"
                        title="Delete note"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

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
                onMouseDown={onUpdateTextElement ? (e) => handleTextMouseDown(e, textElement.id) : undefined}
                onMouseMove={onUpdateTextElement ? handleTextMouseMove : undefined}
                onMouseUp={onUpdateTextElement ? handleTextMouseUp : undefined}
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
                onMouseDown={onUpdateArticulation ? (e) => handleArticulationMouseDown(e, articulation.id) : undefined}
                onMouseMove={onUpdateArticulation ? handleArticulationMouseMove : undefined}
                onMouseUp={onUpdateArticulation ? handleArticulationMouseUp : undefined}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <div className="relative">
                  {articulation.type === 'stem' ? (
                    <div 
                      className="flex items-center justify-center"
                      style={{ height: articulation.height || 50 }}
                    >
                      <img
                        src={`/Stem/${articulation.symbol}`}
                        alt={articulation.name}
                        className="object-contain"
                        style={{ 
                          height: `${articulation.height || 50}px`,
                          maxWidth: `${articulation.height || 50}px`
                        }}
                      />
                    </div>
                  ) : articulation.isExtensible ? (
                    <div 
                      className="flex items-center justify-center"
                      style={{ 
                        height: articulation.height || 50,
                        width: articulation.width || (articulation.type === 'tie' ? 100 : 'auto')
                      }}
                    >
                      {articulation.type === 'tie' ? (
                        <svg
                          width={articulation.width || 100}
                          height={articulation.height || 50}
                          viewBox="0 0 100 50"
                          className="drop-shadow-md transition-transform duration-100"
                        >
                          <path
                            d={articulation.flipped 
                              ? "M 10 25 Q 50 45 90 25" 
                              : "M 10 25 Q 50 5 90 25"
                            }
                            fill="none"
                            stroke="#374151"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="cursor-ew-resize hover:stroke-blue-500 transition-colors duration-200"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              if (onUpdateArticulation) {
                                handleArticulationWidthResizeMouseDown(e, articulation.id)
                              }
                            }}
                            title="Drag to extend tie"
                          />
                        </svg>
                      ) : (
                        <span 
                          className="text-gray-800 font-light drop-shadow-md"
                          style={{ 
                            fontSize: `${articulation.height || 50}px`,
                            lineHeight: '1',
                            display: 'block',
                            letterSpacing: articulation.symbol === '||' ? '-0.1em' : '0'
                          }}
                        >
                          {articulation.symbol}
                        </span>
                      )}
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
                  
                  {/* Resize handles for extensible articulations */}
                  {articulation.isExtensible && (
                    <>
                      {/* Height resize handle */}
                      <div
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-blue-500 rounded cursor-ns-resize opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600"
                        onMouseDown={onUpdateArticulation ? (e) => handleArticulationResizeMouseDown(e, articulation.id) : undefined}
                        title="Resize height"
                      />
                      {/* Width resize handle for ties */}
                      {articulation.type === 'tie' && (
                        <div
                          className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-green-500 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-600"
                          onMouseDown={onUpdateArticulation ? (e) => handleArticulationWidthResizeMouseDown(e, articulation.id) : undefined}
                          title="Resize width"
                        />
                      )}
                      {/* Flip button for ties */}
                      {articulation.type === 'tie' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateArticulation?.(articulation.id, { flipped: !articulation.flipped })
                          }}
                          className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-600 flex items-center justify-center text-white text-xs font-bold"
                          title="Flip tie direction"
                        >
                          ↕
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Next note position indicator */}
            {(keyboardEnabled || midiEnabled) && !isTextMode && !selectedArticulation && (
              <div
                className="absolute w-px h-6 bg-purple-400 opacity-100 animate-pulse z-20 translate-y-1/2"
                style={{
                  left: `${nextNotePosition}px`,
                  top: `${currentKeyboardLineY}px`,
                }}
              />
            )}

            {/* Mouse cursor indicator for note placement */}
            {selectedNotation && !isTextMode && !selectedArticulation && !keyboardEnabled && !midiEnabled && (
              <div
                className="absolute w-8 h-8 bg-purple-500 bg-opacity-30 border-2 border-purple-500 rounded-full z-20 pointer-events-none"
                style={{
                  left: `${nextNotePosition - 16}px`,
                  top: `${currentKeyboardLineY - 16}px`,
                }}
              />
            )}

            {/* Note preview at cursor position */}
            {selectedNotation && !isTextMode && !selectedArticulation && !keyboardEnabled && !midiEnabled && (
              <div
                className="absolute z-20 pointer-events-none opacity-50"
                style={{
                  left: `${nextNotePosition}px`,
                  top: `${currentKeyboardLineY}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <img
                  src={selectedNotation.image || "/placeholder.svg"}
                  alt={selectedNotation.name || "Note"}
                  className="w-[80px] h-[80px] object-contain"
                  style={{
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                />
              </div>
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formatting</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewTextBold(!newTextBold)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-200 ${
                        newTextBold
                          ? "border-purple-500 bg-purple-50 text-purple-700"
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
                          ? "border-purple-500 bg-purple-50 text-purple-700"
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
                          ? "border-purple-500 bg-purple-50 text-purple-700"
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
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">Instructions:</h3>
                <ul className="text-sm text-purple-800 space-y-1">
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
                <h3 className="font-semibold text-purple-900 mt-4 mb-2">Enhanced MIDI Mapping (a-z then A-S):</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-purple-800">
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

export default DNRScoresheet
