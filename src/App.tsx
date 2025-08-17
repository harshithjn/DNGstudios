"use client"

import React, { useState, useEffect, useCallback } from "react"
import HomePage from "./components/HomePage"
import ProjectHeader from "./components/ProjectHeader"
import NotePalette from "./components/NotePalette"
import ScoreSheet from "./components/ScoreSheet"
import DNRScoresheet from "./components/DNRScoresheet"
import RightSidebar from "./components/RightSidebar"
import Auth from "./components/Auth"
import LandingPage from "./components/LandingPage"
import FeaturesPage from "./components/FeaturesPage"
import { useSupabase, type ScorePage, type PlacedNotation } from "./hooks/useSupabase"
import { testSupabaseConnection } from "./lib/test-connection"
import type { Notation } from "./data/notations"
import { useUndoRedo } from "./hooks/useUndoRedo"
import { type ScoreMode } from "./components/ModeSelector"

export interface TextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  bold: boolean
  italic: boolean
  underline: boolean
}

export interface ArticulationElement {
  id: string
  type: string
  name: string
  symbol: string
  x: number
  y: number
  height?: number // For extensible bar lines
  isExtensible?: boolean // Flag to identify extensible elements
}

function App() {
  const [showLandingPage, setShowLandingPage] = useState(true)
  const [showFeaturesPage, setShowFeaturesPage] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [currentProject, setCurrentProject] = useState<ScorePage | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedNotation, setSelectedNotation] = useState<Notation | null>(null)
  const [selectedAccidental, setSelectedAccidental] = useState<string | null>(null)
  const [selectedArticulation, setSelectedArticulation] = useState<string | null>(null)
  const [isTextMode, setIsTextMode] = useState(false)
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [articulationElements, setArticulationElements] = useState<ArticulationElement[]>([])
  const [scoreMode, setScoreMode] = useState<ScoreMode>('normal')

  const { loadScorePage, saveNotes, addNote, removeNote } = useSupabase()

  // Initialize undo/redo system for notes
  const {
    currentState: notesState,
    pushState: pushNotesState,
    undo: undoNotes,
    redo: redoNotes,
    canUndo: canUndoNotes,
    canRedo: canRedoNotes,
    reset: resetNotesHistory
  } = useUndoRedo<PlacedNotation[]>([])

  // Initialize undo/redo system for text elements
  const {
    currentState: textState,
    pushState: pushTextState,
    reset: resetTextHistory
  } = useUndoRedo<TextElement[]>([])

  // Initialize undo/redo system for articulation elements
  const {
    currentState: articulationState,
    pushState: pushArticulationState,
    reset: resetArticulationHistory
  } = useUndoRedo<ArticulationElement[]>([])

  // Test Supabase connection on app startup
  useEffect(() => {
    testSupabaseConnection()
  }, [])

  // Handle authentication
  const handleAuthenticated = useCallback(() => {
    setIsAuthenticated(true)
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
  }, [])

  const handleLaunchApp = useCallback(() => {
    setShowLandingPage(false)
  }, [])

  const handleBackToLanding = useCallback(() => {
    setShowLandingPage(true)
    setShowFeaturesPage(false)
  }, [])

  const handleShowFeatures = useCallback(() => {
    setShowLandingPage(false)
    setShowFeaturesPage(true)
  }, [])

  const handleOpenProject = useCallback(async (projectId: string, projectType: "DNG" | "DNR") => {
    const loadedProject = await loadScorePage(projectId)
    if (loadedProject) {
      setCurrentProject(loadedProject)
      setCurrentProjectId(projectId)
      // Set the score mode based on project type
      setScoreMode(projectType)
      // Reset undo/redo history with loaded project
      resetNotesHistory(loadedProject.notes)
      resetTextHistory([])
      resetArticulationHistory([])
    }
  }, [loadScorePage, resetNotesHistory, resetTextHistory, resetArticulationHistory])

  const handleBackToHome = async () => {
    if (currentProject && currentProjectId) {
      await saveNotes(currentProjectId, currentProject.notes)
    }
    setCurrentProjectId(null)
    setCurrentProject(null)
  }

  const handleAddNote = async (note: PlacedNotation) => {
    if (currentProject && currentProjectId) {
      const createdNote = await addNote(currentProjectId, note)
      if (createdNote) {
        const newNotes = [...currentProject.notes, createdNote]
        setCurrentProject(prev => prev ? {
          ...prev,
          notes: newNotes
        } : null)
        pushNotesState(newNotes)
      }
    }
  }

  const handleRemoveNote = async (noteId: string) => {
    if (currentProject && currentProjectId) {
      const success = await removeNote(currentProjectId, noteId)
      if (success) {
        const newNotes = currentProject.notes.filter(note => note.id !== noteId)
        setCurrentProject(prev => prev ? {
          ...prev,
          notes: newNotes
        } : null)
        pushNotesState(newNotes)
      }
    }
  }

  const handleUpdateNote = async (noteId: string, updates: Partial<PlacedNotation>) => {
    if (currentProject && currentProjectId) {
      const newNotes = currentProject.notes.map(note => 
        note.id === noteId ? { ...note, ...updates } : note
      )
      setCurrentProject(prev => prev ? {
        ...prev,
        notes: newNotes
      } : null)
      pushNotesState(newNotes)
    }
  }

  const handleClearPage = async () => {
    if (currentProject && currentProjectId) {
      const success = await saveNotes(currentProjectId, [])
      if (success) {
        setCurrentProject(prev => prev ? {
          ...prev,
          notes: []
        } : null)
        pushNotesState([])
      }
    }
  }

  const handleUpdatePageSettings = (settings: Partial<ScorePage>) => {
    setCurrentProject(prev => prev ? {
      ...prev,
      ...settings
    } : null)
  }

  const handleAddTextElement = (textElement: TextElement) => {
    const newTextElements = [...textElements, textElement]
    setTextElements(newTextElements)
    pushTextState(newTextElements)
  }

  const handleRemoveTextElement = (id: string) => {
    const newTextElements = textElements.filter(el => el.id !== id)
    setTextElements(newTextElements)
    pushTextState(newTextElements)
  }

  const handleUpdateTextElement = (id: string, updates: Partial<TextElement>) => {
    const newTextElements = textElements.map(el => el.id === id ? { ...el, ...updates } : el)
    setTextElements(newTextElements)
    pushTextState(newTextElements)
  }

  const handleAddArticulation = (articulation: ArticulationElement) => {
    const newArticulationElements = [...articulationElements, articulation]
    setArticulationElements(newArticulationElements)
    pushArticulationState(newArticulationElements)
  }

  const handleRemoveArticulation = (id: string) => {
    const newArticulationElements = articulationElements.filter(el => el.id !== id)
    setArticulationElements(newArticulationElements)
    pushArticulationState(newArticulationElements)
  }

  const handleUpdateArticulation = (id: string, updates: Partial<ArticulationElement>) => {
    const newArticulationElements = articulationElements.map(el => el.id === id ? { ...el, ...updates } : el)
    setArticulationElements(newArticulationElements)
    pushArticulationState(newArticulationElements)
  }

  // Handle keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault()
          undoNotes()
        } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault()
          redoNotes()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undoNotes, redoNotes])

  // Sync undo/redo state with current project
  useEffect(() => {
    if (currentProject && notesState !== currentProject.notes) {
      setCurrentProject(prev => prev ? {
        ...prev,
        notes: notesState
      } : null)
    }
  }, [notesState, currentProject])

  useEffect(() => {
    if (textState !== textElements) {
      setTextElements(textState)
    }
  }, [textState, textElements])

  useEffect(() => {
    if (articulationState !== articulationElements) {
      setArticulationElements(articulationState)
    }
  }, [articulationState, articulationElements])

  // Auto-save notes when they change
  useEffect(() => {
    if (currentProject && currentProjectId) {
      const timeoutId = setTimeout(() => {
        saveNotes(currentProjectId, currentProject.notes)
      }, 1000) // Debounce for 1 second

      return () => clearTimeout(timeoutId)
    }
  }, [currentProject, currentProjectId, saveNotes])

  // Show landing page first
  if (showLandingPage) {
    return <LandingPage onLaunchApp={handleLaunchApp} onShowFeatures={handleShowFeatures} />
  }

  // Show features page
  if (showFeaturesPage) {
    return <FeaturesPage onBackToLanding={handleBackToLanding} onLaunchApp={handleLaunchApp} />
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <Auth onAuthenticated={handleAuthenticated} />
  }

  if (!currentProjectId || !currentProject) {
    return (
      <HomePage
        onOpenProject={handleOpenProject}
        onLogout={handleLogout}
        onBackToLanding={handleBackToLanding}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ProjectHeader 
        project={currentProject} 
        onTitleChange={(title) => handleUpdatePageSettings({ title })} 
        onBackToHome={handleBackToHome} 
        onLogout={handleLogout}
        scoreMode={scoreMode}
        onScoreModeChange={setScoreMode}
        onBackToLanding={handleBackToLanding}
      />
      <div className="flex flex-1">
        <NotePalette
          selectedNotation={selectedNotation}
          onNotationSelect={setSelectedNotation}
          selectedAccidental={selectedAccidental}
          onAccidentalSelect={setSelectedAccidental}
        />
        {scoreMode === 'dnr' || scoreMode === 'DNR' ? (
          <DNRScoresheet
            selectedNotation={selectedNotation}
            currentPage={currentProject}
            onAddNote={handleAddNote}
            onRemoveNote={handleRemoveNote}
            onUpdateNote={handleUpdateNote}
            onClearPage={handleClearPage}
            onUpdatePageSettings={handleUpdatePageSettings}
            textElements={textElements}
            onAddTextElement={handleAddTextElement}
            onRemoveTextElement={handleRemoveTextElement}
            onUpdateTextElement={handleUpdateTextElement}
            articulationElements={articulationElements}
            onAddArticulation={handleAddArticulation}
            onRemoveArticulation={handleRemoveArticulation}
            onUpdateArticulation={handleUpdateArticulation}
            selectedArticulation={selectedArticulation}
            isTextMode={isTextMode}
            canUndo={canUndoNotes}
            canRedo={canRedoNotes}
            onUndo={undoNotes}
            onRedo={redoNotes}
          />
        ) : (
          <ScoreSheet
            selectedNotation={selectedNotation}
            currentPage={currentProject}
            onAddNote={handleAddNote}
            onRemoveNote={handleRemoveNote}
            onUpdateNote={handleUpdateNote}
            onClearPage={handleClearPage}
            onUpdatePageSettings={handleUpdatePageSettings}
            textElements={textElements}
            onAddTextElement={handleAddTextElement}
            onRemoveTextElement={handleRemoveTextElement}
            onUpdateTextElement={handleUpdateTextElement}
            articulationElements={articulationElements}
            onAddArticulation={handleAddArticulation}
            onRemoveArticulation={handleRemoveArticulation}
            onUpdateArticulation={handleUpdateArticulation}
            selectedArticulation={selectedArticulation}
            isTextMode={isTextMode}
            canUndo={canUndoNotes}
            canRedo={canRedoNotes}
            onUndo={undoNotes}
            onRedo={redoNotes}
            scoreMode={scoreMode}
          />
        )}
        <RightSidebar
          selectedArticulation={selectedArticulation}
          onArticulationSelect={setSelectedArticulation}
          isTextMode={isTextMode}
          onTextModeToggle={setIsTextMode}
          currentPage={currentProject}
          onUpdatePageSettings={handleUpdatePageSettings}
        />
      </div>
    </div>
  )
}

export default App
