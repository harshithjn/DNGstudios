"use client"

import React, { useState, useEffect, useCallback } from "react"
import HomePage from "./components/HomePage"
import ProjectHeader from "./components/ProjectHeader"
import NotePalette from "./components/NotePalette"
import ScoreSheet from "./components/ScoreSheet"
import RightSidebar from "./components/RightSidebar"
import Auth from "./components/Auth"
import { useSupabase, type ScorePage, type PlacedNotation } from "./hooks/useSupabase"
import { testSupabaseConnection } from "./lib/test-connection"
import type { Notation } from "./data/notations"

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
}

function App() {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [currentProject, setCurrentProject] = useState<ScorePage | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedNotation, setSelectedNotation] = useState<Notation | null>(null)
  const [selectedAccidental, setSelectedAccidental] = useState<string | null>(null)
  const [selectedArticulation, setSelectedArticulation] = useState<string | null>(null)
  const [isTextMode, setIsTextMode] = useState(false)
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [articulationElements, setArticulationElements] = useState<ArticulationElement[]>([])

  const { loadScorePage, saveNotes, addNote, removeNote } = useSupabase()

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

  const handleOpenProject = useCallback(async (projectId: string) => {
    const loadedProject = await loadScorePage(projectId)
    if (loadedProject) {
      setCurrentProject(loadedProject)
      setCurrentProjectId(projectId)
    }
  }, [loadScorePage])

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
        setCurrentProject(prev => prev ? {
          ...prev,
          notes: [...prev.notes, createdNote] // Use the note with database ID
        } : null)
      }
    }
  }

  const handleRemoveNote = async (noteId: string) => {
    if (currentProject && currentProjectId) {
      const success = await removeNote(currentProjectId, noteId)
      if (success) {
        setCurrentProject(prev => prev ? {
          ...prev,
          notes: prev.notes.filter(note => note.id !== noteId)
        } : null)
      }
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
    setTextElements(prev => [...prev, textElement])
  }

  const handleRemoveTextElement = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id))
  }

  const handleUpdateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const handleAddArticulation = (articulation: ArticulationElement) => {
    setArticulationElements(prev => [...prev, articulation])
  }

  const handleRemoveArticulation = (id: string) => {
    setArticulationElements(prev => prev.filter(el => el.id !== id))
  }

  // Auto-save notes when they change
  useEffect(() => {
    if (currentProject && currentProjectId) {
      const timeoutId = setTimeout(() => {
        saveNotes(currentProjectId, currentProject.notes)
      }, 1000) // Debounce for 1 second

      return () => clearTimeout(timeoutId)
    }
  }, [currentProject, currentProjectId, saveNotes])

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <Auth onAuthenticated={handleAuthenticated} />
  }

  if (!currentProjectId || !currentProject) {
    return (
      <HomePage
        onOpenProject={handleOpenProject}
        onLogout={handleLogout}
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
      />
      <div className="flex flex-1">
        <NotePalette
          selectedNotation={selectedNotation}
          onNotationSelect={setSelectedNotation}
          selectedAccidental={selectedAccidental}
          onAccidentalSelect={setSelectedAccidental}
        />
        <ScoreSheet
          selectedNotation={selectedNotation}
          currentPage={currentProject}
          onAddNote={handleAddNote}
          onRemoveNote={handleRemoveNote}
          onClearPage={handleClearPage}
          onUpdatePageSettings={handleUpdatePageSettings}
          textElements={textElements}
          onAddTextElement={handleAddTextElement}
          onRemoveTextElement={handleRemoveTextElement}
          onUpdateTextElement={handleUpdateTextElement}
          articulationElements={articulationElements}
          onAddArticulation={handleAddArticulation}
          onRemoveArticulation={handleRemoveArticulation}
          selectedArticulation={selectedArticulation}
          isTextMode={isTextMode}
        />
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
