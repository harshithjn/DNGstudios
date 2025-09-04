"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import HomePage from "./components/HomePage"
import ProjectHeader from "./components/ProjectHeader"
import NotePalette from "./components/NotePalette"

import ScoreSheet from "./components/ScoreSheet"
import DNRScoresheet from "./components/DNRScoresheet"
import RightSidebar from "./components/RightSidebar"
import Auth from "./components/Auth"
import LandingPage from "./components/LandingPage"
import FeaturesPage from "./components/FeaturesPage"
import PageNavigation from "./components/PageNavigation"
import LayoutSettings from "./components/LayoutSettings"
import { useLocalStorage, type ScorePage, type PlacedNotation } from "./hooks/useLocalStorage"
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
  type: string //acive
  name: string
  symbol: string
  x: number
  y: number
  height?: number // For extensible bar lines
  isExtensible?: boolean // Flag to identify extensible elements
}

export interface LyricElement {
  id: string
  noteId: string
  text: string
  x: number
  y: number
  fontSize: number
}

export interface HighlighterElement {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: 'red' | 'green' | 'blue' | 'yellow'
  opacity: number
}

export interface DefaultBarLine {
  id: string
  x: number
  y: number
  height: number
}



function App() {
  const [showLandingPage, setShowLandingPage] = useState(() => {
    // Check if we're returning to a project (persist state on reload)
    const savedProjectId = localStorage.getItem('currentProjectId')
    const savedProject = localStorage.getItem('currentProject')
    return !savedProjectId || !savedProject
  })
  const [showFeaturesPage, setShowFeaturesPage] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    return localStorage.getItem('currentProjectId')
  })
  const [currentProject, setCurrentProject] = useState<ScorePage | null>(() => {
    const saved = localStorage.getItem('currentProject')
    return saved ? JSON.parse(saved) : null
  })
  const [pages, setPages] = useState<ScorePage[]>(() => {
    const saved = localStorage.getItem('projectPages')
    return saved ? JSON.parse(saved) : []
  })
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true'
  })
  const [selectedNotation, setSelectedNotation] = useState<Notation | null>(null)

  const [selectedArticulation, setSelectedArticulation] = useState<string | null>(null)
  const [isTextMode, setIsTextMode] = useState(false)
  const [isLyricsMode, setIsLyricsMode] = useState(false)
  const [isHighlighterMode, setIsHighlighterMode] = useState(false)

  const [selectedHighlighterColor, setSelectedHighlighterColor] = useState<'red' | 'green' | 'blue' | 'yellow'>('yellow')
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [articulationElements, setArticulationElements] = useState<ArticulationElement[]>([])
  const [lyricElements, setLyricElements] = useState<LyricElement[]>([])
  const [highlighterElements, setHighlighterElements] = useState<HighlighterElement[]>([])
  
  // Ref to track current articulations for reliable access
  const articulationElementsRef = useRef<ArticulationElement[]>([])
  
  // Update ref whenever articulation elements change
  useEffect(() => {
    articulationElementsRef.current = articulationElements
  }, [articulationElements])

  const [scoreMode, setScoreMode] = useState<ScoreMode>(() => {
    // Initialize from localStorage or default to 'normal'
    const savedMode = localStorage.getItem('scoreMode') as ScoreMode
    return savedMode || 'normal'
  })

  // Save score mode to localStorage whenever it changes
  const handleScoreModeChange = useCallback((mode: ScoreMode) => {
    setScoreMode(mode)
    localStorage.setItem('scoreMode', mode)
  }, [])
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    topMargin: 0.50,
    bottomMargin: 0.50,
    leftMargin: 0.50,
    rightMargin: 0.50,
    headerSpace: 1.00,
    lineDistance: 0.00,
    maxBarsPerLine: 0,
    constantSpacing: 16,
    proportionalSpacing: 16,
    slashSpacing: 16,
    beamingSlantFactor: 4,
    minSlant: 1,
    maxSlant: 4,
    defaultPedalPosition: 144,
    addBracketSpace: true,
    alternatingMargins: false,
    openSingleStaffs: false,
    justifyLastStaff: true,
    alternateRepeatSymbols: false,
    hideMutedNotes: false,
    hideMutedRegions: true,
    hideMutedTracks: false,
  })

  const { loadScorePage, loadProjectPages, saveProjectPages, saveNotes, addNote, removeNote, updateProject, saveProjectMetadata, loadProjectMetadata } = useLocalStorage()

  // Initialize unified undo/redo system
  const {
    currentState: historyState,
    pushState: pushHistoryState,
    undo: undoAction,
    redo: redoAction,
    canUndo: canUndoAction,
    canRedo: canRedoAction,
    reset: resetHistory
  } = useUndoRedo({
    notes: currentProject?.notes || [],
    textElements: textElements || [],
    articulationElements: articulationElements || [],
    
    timestamp: Date.now()
  })


  // Load saved project on app startup if authenticated
  useEffect(() => {
    if (isAuthenticated && currentProjectId && currentProject) {
      // Load pages from localStorage if they exist
      const savedPages = localStorage.getItem('projectPages')
      if (savedPages) {
        const parsedPages = JSON.parse(savedPages)
        setPages(parsedPages)
        // Find the current project in the pages array
        const currentPageIndex = parsedPages.findIndex((page: ScorePage) => page.id === currentProject.id)
        if (currentPageIndex !== -1) {
          setCurrentPageIndex(currentPageIndex)
        }
      } else {
        // Initialize with current project as the only page
        setPages([currentProject])
        setCurrentPageIndex(0)
      }
      
      // Load saved score mode from localStorage or default to normal
      const savedScoreMode = localStorage.getItem('scoreMode') as ScoreMode
      setScoreMode(savedScoreMode || 'normal')
      // Reset undo/redo history with loaded project
      resetHistory({
        notes: currentProject.notes,
        textElements: [],
        articulationElements: [],
        timestamp: Date.now()
      })
    }
  }, [isAuthenticated, currentProjectId, currentProject, resetHistory])

  // Handle authentication
  const handleAuthenticated = useCallback(() => {
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentProjectId')
    localStorage.removeItem('currentProject')
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
    const loadedPages = await loadProjectPages(projectId)
    if (loadedPages && loadedPages.length > 0) {
      // Load project metadata
      const metadata = await loadProjectMetadata(projectId)
      
      // Use all loaded pages
      setPages(loadedPages)
      setCurrentProject(loadedPages[0]) // Set first page as current
      setCurrentProjectId(projectId)
      setCurrentPageIndex(0)
      
      // Set the score mode based on project type and save to localStorage
      const newMode = projectType === 'DNR' ? 'dnr' : 'normal'
      setScoreMode(newMode)
      localStorage.setItem('scoreMode', newMode)
      
      // Load saved elements from metadata
      setTextElements(metadata?.textElements || [])
      setArticulationElements(metadata?.articulationElements || [])
      setLyricElements(metadata?.lyricElements || [])
      setHighlighterElements(metadata?.highlighterElements || [])
      
      // Reset undo/redo history with loaded project
      resetHistory({
        notes: loadedPages[0].notes,
        textElements: metadata?.textElements || [],
        articulationElements: metadata?.articulationElements || [],
        timestamp: Date.now()
      })
      
      // Persist to localStorage
      localStorage.setItem('currentProjectId', projectId)
      localStorage.setItem('currentProject', JSON.stringify(loadedPages[0]))
      localStorage.setItem('projectPages', JSON.stringify(loadedPages))
    }
  }, [loadProjectPages, loadProjectMetadata, resetHistory])

  const handleBackToHome = async () => {
    if (currentProject && currentProjectId) {
      await saveNotes(currentProjectId, currentProject.notes)
      // Save project metadata
      await saveProjectMetadata(currentProjectId, {
        textElements,
        articulationElements,
        lyricElements,
        highlighterElements
      })
    }
    setCurrentProjectId(null)
    setCurrentProject(null)
    setPages([])
    setCurrentPageIndex(0)
    // Clear localStorage
    localStorage.removeItem('currentProjectId')
    localStorage.removeItem('currentProject')
    localStorage.removeItem('projectPages')
  }

  const handleAddNote = async (note: PlacedNotation) => {
    console.log('handleAddNote called with:', note)
    console.log('Current project:', currentProject)
    console.log('Current project ID:', currentProjectId)
    if (currentProject && currentProjectId) {
      console.log('Current project ID:', currentProjectId)
      console.log('Current notes count:', currentProject.notes.length)
      
      try {
        const createdNote = await addNote(currentProjectId, note)
        console.log('Created note result:', createdNote)
        
        if (createdNote) {
          const newNotes = [...currentProject.notes, createdNote]
          console.log('New notes array length:', newNotes.length)
          
          // Update current project state
          setCurrentProject(prev => prev ? {
            ...prev,
            notes: newNotes
          } : null)
          
          // Update the page in the pages array
          setPages(prevPages => 
            prevPages.map((page, index) => 
              index === currentPageIndex 
                ? { ...page, notes: newNotes }
                : page
            )
          )
          
          // Use ref to get the most current articulation elements
          const currentArticulations = articulationElementsRef.current
          
          // Push to unified history with the new notes AND preserve articulation elements
          console.log('Pushing to history with', newNotes.length, 'notes and', currentArticulations.length, 'articulations')
          pushHistoryState({
            notes: newNotes,
            textElements: textElements,
            articulationElements: currentArticulations,
            timestamp: Date.now()
          })
          
          console.log('Note added successfully, history should be updated')
        } else {
          console.error('Failed to create note - addNote returned null')
          // Fallback: Add note locally if database fails
          console.log('Adding note locally as fallback')
          const fallbackNote = { ...note, id: Date.now().toString() }
          const newNotes = [...currentProject.notes, fallbackNote]
          
          setCurrentProject(prev => prev ? {
            ...prev,
            notes: newNotes
          } : null)
          
          setPages(prevPages => 
            prevPages.map((page, index) => 
              index === currentPageIndex 
                ? { ...page, notes: newNotes }
                : page
            )
          )
          
          // Use ref to get the most current articulation elements
          const currentArticulations = articulationElementsRef.current
          
          pushHistoryState({
            notes: newNotes,
            textElements: textElements,
            articulationElements: currentArticulations,
            timestamp: Date.now()
          })
        }
      } catch (error) {
        console.error('Error in handleAddNote:', error)
        // Fallback: Add note locally if database fails
        console.log('Adding note locally as fallback due to error')
        const fallbackNote = { ...note, id: Date.now().toString() }
        const newNotes = [...currentProject.notes, fallbackNote]
        
        setCurrentProject(prev => prev ? {
          ...prev,
          notes: newNotes
        } : null)
        
        setPages(prevPages => 
          prevPages.map((page, index) => 
            index === currentPageIndex 
              ? { ...page, notes: newNotes }
              : page
          )
        )
        
        pushHistoryState({
          notes: newNotes,
          textElements: textElements,
          articulationElements: articulationElementsRef.current,
            
          timestamp: Date.now()
        })
      }
    } else {
      console.log('No current project or project ID')
    }
  }

  const handleRemoveNote = async (noteId: string) => {
    console.log('handleRemoveNote called with noteId:', noteId)
    console.log('Current project:', currentProject)
    console.log('Current project ID:', currentProjectId)
    
    if (currentProject && currentProjectId) {
      try {
        const success = await removeNote(currentProjectId, noteId)
        console.log('Remove note result:', success)
        
        if (success) {
          const newNotes = currentProject.notes.filter(note => note.id !== noteId)
          console.log('New notes array length after removal:', newNotes.length)
          
          setCurrentProject(prev => prev ? {
            ...prev,
            notes: newNotes
          } : null)
          
          // Update the page in the pages array
          setPages(prevPages => 
            prevPages.map((page, index) => 
              index === currentPageIndex 
                ? { ...page, notes: newNotes }
                : page
            )
          )
          
          // Push to unified history AND preserve articulation elements
          pushHistoryState({
            notes: newNotes,
            textElements: textElements,
            articulationElements: articulationElementsRef.current,
            
            timestamp: Date.now()
          })
          
          console.log('Note removed successfully')
        } else {
          console.error('Failed to remove note from database - applying fallback')
          // Fallback: Remove note locally if database fails
          const newNotes = currentProject.notes.filter(note => note.id !== noteId)
          
          setCurrentProject(prev => prev ? {
            ...prev,
            notes: newNotes
          } : null)
          
          setPages(prevPages => 
            prevPages.map((page, index) => 
              index === currentPageIndex 
                ? { ...page, notes: newNotes }
                : page
            )
          )
          
          pushHistoryState({
            notes: newNotes,
            textElements: textElements,
            articulationElements: articulationElementsRef.current,
            
            timestamp: Date.now()
          })
        }
      } catch (error) {
        console.error('Error in handleRemoveNote:', error)
        // Fallback: Remove note locally if database fails
        console.log('Removing note locally as fallback due to error')
        const newNotes = currentProject.notes.filter(note => note.id !== noteId)
        
        setCurrentProject(prev => prev ? {
          ...prev,
          notes: newNotes
        } : null)
        
        setPages(prevPages => 
          prevPages.map((page, index) => 
            index === currentPageIndex 
              ? { ...page, notes: newNotes }
              : page
          )
        )
        
        pushHistoryState({
          notes: newNotes,
          textElements: textElements,
          articulationElements: articulationElementsRef.current,
            
          timestamp: Date.now()
        })
      }
    } else {
      console.log('No current project or project ID')
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
      
      // Update the page in the pages array
      setPages(prevPages => 
        prevPages.map((page, index) => 
          index === currentPageIndex 
            ? { ...page, notes: newNotes }
            : page
        )
      )
      
      // Push to unified history AND preserve articulation elements
      pushHistoryState({
        notes: newNotes,
        textElements: textElements,
                    articulationElements: articulationElementsRef.current,
            
        timestamp: Date.now()
      })
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
        
        // Update the page in the pages array
        setPages(prevPages => 
          prevPages.map((page, index) => 
            index === currentPageIndex 
              ? { ...page, notes: [] }
              : page
          )
        )
        
        // Push to unified history AND preserve articulation elements
        pushHistoryState({
          notes: [],
          textElements: textElements,
          articulationElements: articulationElementsRef.current,
            
          timestamp: Date.now()
        })
      }
    }
  }

  const handleUpdatePageSettings = (settings: Partial<ScorePage>) => {
    setCurrentProject(prev => prev ? {
      ...prev,
      ...settings
    } : null)
    
    // Also update the page in the pages array
    setPages(prevPages => 
      prevPages.map((page, index) => 
        index === currentPageIndex 
          ? { ...page, ...settings }
          : page
      )
    )
  }

  const handleAddPage = async () => {
    console.log('handleAddPage called!')
    try {
      if (!currentProject || !currentProjectId) {
        console.error('Cannot add page: No current project or project ID')
        return
      }

      console.log('Adding new page, current pages count:', pages.length)
      
      // First, save the current page's data to the pages array
      const updatedPages = pages.map((page, index) => 
        index === currentPageIndex 
          ? { 
              ...page, 
              notes: currentProject.notes || [],
              textElements: textElements || [],
              articulationElements: articulationElements || [],
              lyricElements: lyricElements || [],
              highlighterElements: highlighterElements || []
            }
          : page
      )
      
      // Create a new page with the same settings
      const newPage: ScorePage = {
        id: Date.now().toString(),
        title: `Page ${pages.length + 1}`,
        notes: [],
        timeSignature: currentProject.timeSignature || { numerator: 4, denominator: 4 },
        keySignature: currentProject.keySignature || 'C',
        tempo: currentProject.tempo || 120,
        keyboardLineSpacing: currentProject.keyboardLineSpacing || 108,
        textElements: [],
        articulationElements: [],
        lyricElements: [],
        highlighterElements: [],
        defaultBarLines: []
      }
      
      // Add the new page to the pages array
      const newPages = [...updatedPages, newPage]
      setPages(newPages)
      setCurrentPageIndex(newPages.length - 1)
      setCurrentProject(newPage)
      
      // Reset history for the new page
      resetHistory({
        notes: [],
        textElements: [],
        articulationElements: [],
        lyricElements: [],
        highlighterElements: [],
        timestamp: Date.now()
      })
      
      // Clear all elements for the new page
      setTextElements([])
      setArticulationElements([])
      setLyricElements([])
      setHighlighterElements([])
      
      // Save all pages to localStorage using the new function
      await saveProjectPages(currentProjectId, newPages)
      
      // Also update local localStorage for immediate access
      localStorage.setItem('projectPages', JSON.stringify(newPages))
      localStorage.setItem('currentProject', JSON.stringify(newPage))
      
      console.log('Successfully added new page. Total pages:', newPages.length)
    } catch (error) {
      console.error('Error adding new page:', error)
    }
  }

  const handlePageChange = async (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length && pageIndex !== currentPageIndex) {
      console.log(`Switching from page ${currentPageIndex} to page ${pageIndex}`)
      
      // First, save the current page's data before switching
      const updatedPages = pages.map((page, index) => {
        if (index === currentPageIndex) {
          console.log(`Saving current page ${index} data:`, {
            notes: currentProject?.notes?.length || 0,
            textElements: textElements.length,
            articulationElements: articulationElements.length,
            lyricElements: lyricElements.length,
            highlighterElements: highlighterElements.length
          })
          return { 
            ...page, 
            notes: currentProject?.notes || [],
            textElements: textElements,
            articulationElements: articulationElementsRef.current,
            lyricElements: lyricElements,
            highlighterElements: highlighterElements
          }
        }
        return page
      })
      
      // Update pages with current page's saved data
      setPages(updatedPages)
      
      const selectedPage = updatedPages[pageIndex]
      console.log(`Loading page ${pageIndex} data:`, {
        notes: selectedPage.notes?.length || 0,
        textElements: selectedPage.textElements?.length || 0,
        articulationElements: selectedPage.articulationElements?.length || 0,
        lyricElements: selectedPage.lyricElements?.length || 0,
        highlighterElements: selectedPage.highlighterElements?.length || 0
      })
      
      setCurrentPageIndex(pageIndex)
      setCurrentProject(selectedPage)
      
      // Load the page's saved elements
      setTextElements(selectedPage.textElements || [])
      setArticulationElements(selectedPage.articulationElements || [])
      setLyricElements(selectedPage.lyricElements || [])
      setHighlighterElements(selectedPage.highlighterElements || [])
      
      // Reset history for the selected page
      resetHistory({
        notes: selectedPage.notes,
        textElements: selectedPage.textElements || [],
        articulationElements: selectedPage.articulationElements || [],
        timestamp: Date.now()
      })
      
      // Save all pages to localStorage using the new function
      if (currentProjectId) {
        await saveProjectPages(currentProjectId, updatedPages)
      }
      
      // Also update local localStorage for immediate access
      localStorage.setItem('projectPages', JSON.stringify(updatedPages))
      localStorage.setItem('currentProject', JSON.stringify(selectedPage))
    }
  }

  const handleRemovePage = async (pageIndex: number) => {
    if (pages.length > 1 && pageIndex >= 0 && pageIndex < pages.length) {
      const newPages = pages.filter((_, index) => index !== pageIndex)
      setPages(newPages)
      
      // If we're removing the current page, switch to the previous page
      if (pageIndex === currentPageIndex) {
        const newIndex = Math.max(0, pageIndex - 1)
        setCurrentPageIndex(newIndex)
        setCurrentProject(newPages[newIndex])
        localStorage.setItem('currentProject', JSON.stringify(newPages[newIndex]))
      } else if (pageIndex < currentPageIndex) {
        // Adjust current page index if we removed a page before it
        setCurrentPageIndex(currentPageIndex - 1)
      }
      
      // Save all pages to localStorage using the new function
      if (currentProjectId) {
        await saveProjectPages(currentProjectId, newPages)
      }
      
      localStorage.setItem('projectPages', JSON.stringify(newPages))
    }
  }

    const handleAddTextElement = (textElement: TextElement) => {
    const newTextElements = [...textElements, textElement]
    setTextElements(newTextElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: newTextElements,
                  articulationElements: articulationElementsRef.current,
      
      timestamp: Date.now()
    })
    
    // Save to database
    if (currentProjectId) {
      saveProjectMetadata(currentProjectId, {
        textElements: newTextElements,
        articulationElements,
        lyricElements,
        highlighterElements
      })
    }
  }

  const handleRemoveTextElement = (id: string) => {
    const newTextElements = textElements.filter(el => el.id !== id)
    setTextElements(newTextElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: newTextElements,
                  articulationElements: articulationElementsRef.current,
            
      timestamp: Date.now()
    })
  }

  const handleUpdateTextElement = (id: string, updates: Partial<TextElement>) => {
    const newTextElements = textElements.map(el => el.id === id ? { ...el, ...updates } : el)
    setTextElements(newTextElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: newTextElements,
                  articulationElements: articulationElementsRef.current,
            
      timestamp: Date.now()
    })
  }

  const handleAddArticulation = (articulation: ArticulationElement) => {
    const newArticulationElements = [...articulationElements, articulation]
    setArticulationElements(newArticulationElements)
    
    // Push to unified history - ensure we have the most current notes
    const currentNotes = currentProject?.notes || []
    console.log('Adding articulation, preserving', currentNotes.length, 'notes')
    pushHistoryState({
      notes: currentNotes,
      textElements: textElements,
      articulationElements: newArticulationElements,
      timestamp: Date.now()
    })
    
    // Save to database immediately
    if (currentProjectId) {
      saveProjectMetadata(currentProjectId, {
        textElements: textElements,
        articulationElements: newArticulationElements,
        lyricElements: lyricElements,
        highlighterElements: highlighterElements
      })
    }
  }

  const handleRemoveArticulation = (id: string) => {
    const newArticulationElements = articulationElements.filter(el => el.id !== id)
    setArticulationElements(newArticulationElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: textElements,
      articulationElements: newArticulationElements,
      timestamp: Date.now()
    })
    
    // Save to database immediately
    if (currentProjectId) {
      saveProjectMetadata(currentProjectId, {
        textElements: textElements,
        articulationElements: newArticulationElements,
        lyricElements: lyricElements,
        highlighterElements: highlighterElements
      })
    }
  }

  const handleUpdateArticulation = (id: string, updates: Partial<ArticulationElement>) => {
    const newArticulationElements = articulationElements.map(el => el.id === id ? { ...el, ...updates } : el)
    setArticulationElements(newArticulationElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: textElements,
      articulationElements: newArticulationElements,
      timestamp: Date.now()
    })
    
    // Save to database immediately
    if (currentProjectId) {
      saveProjectMetadata(currentProjectId, {
        textElements: textElements,
        articulationElements: newArticulationElements,
        lyricElements: lyricElements,
        highlighterElements: highlighterElements
      })
    }
  }







  const handleAddLyric = (lyric: LyricElement) => {
    const newLyricElements = [...lyricElements, lyric]
    setLyricElements(newLyricElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: textElements,
                  articulationElements: articulationElementsRef.current,
            
      timestamp: Date.now()
    })
  }

  const handleRemoveLyric = (id: string) => {
    const newLyricElements = lyricElements.filter(el => el.id !== id)
    setLyricElements(newLyricElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: textElements,
                  articulationElements: articulationElementsRef.current,
            
      timestamp: Date.now()
    })
  }

  const handleUpdateLyric = (id: string, updates: Partial<LyricElement>) => {
    const newLyricElements = lyricElements.map(el => el.id === id ? { ...el, ...updates } : el)
    setLyricElements(newLyricElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: textElements,
                  articulationElements: articulationElementsRef.current,
            
      timestamp: Date.now()
    })
  }

  const handleAddHighlighter = (highlighter: HighlighterElement) => {
    const newHighlighterElements = [...highlighterElements, highlighter]
    setHighlighterElements(newHighlighterElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: textElements,
                  articulationElements: articulationElementsRef.current,
            
      timestamp: Date.now()
    })
  }

  const handleRemoveHighlighter = (id: string) => {
    const newHighlighterElements = highlighterElements.filter(el => el.id !== id)
    setHighlighterElements(newHighlighterElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: textElements,
                  articulationElements: articulationElementsRef.current,
            
      timestamp: Date.now()
    })
  }

  const handleUpdateHighlighter = (id: string, updates: Partial<HighlighterElement>) => {
    const newHighlighterElements = highlighterElements.map(el => el.id === id ? { ...el, ...updates } : el)
    setHighlighterElements(newHighlighterElements)
    
    // Push to unified history
    pushHistoryState({
      notes: currentProject?.notes || [],
      textElements: textElements,
                  articulationElements: articulationElementsRef.current,
            
      timestamp: Date.now()
    })
  }

  const handleUpdateLayoutSettings = (settings: Partial<LayoutSettings>) => {
    setLayoutSettings(prev => ({
      ...prev,
      ...settings
    }))
  }

  // Handle keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault()
          console.log('Undo keyboard shortcut triggered')
          undoAction()
        } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault()
          console.log('Redo keyboard shortcut triggered')
          redoAction()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undoAction, redoAction])

  // Reset undo/redo system only when project ID changes (not on every render)
  useEffect(() => {
    if (currentProject) {
      console.log('Resetting undo/redo system for new project with', currentProject.notes.length, 'notes')
      resetHistory({
        notes: currentProject.notes,
        textElements: textElements || [],
        articulationElements: articulationElements || [],
        timestamp: Date.now()
      })
    }
  }, [currentProject?.id, resetHistory])

  // Sync unified undo/redo state with current project
  useEffect(() => {
    if (historyState && currentProject) {
      // Compare notes by JSON string to avoid reference comparison issues
      const currentNotesJson = JSON.stringify(currentProject.notes)
      const historyNotesJson = JSON.stringify(historyState.notes)
      
      if (historyNotesJson !== currentNotesJson) {
        console.log('Updating current project notes from history:', historyState.notes.length, 'vs current:', currentProject.notes.length)
        console.log('History notes:', historyState.notes)
        console.log('Current notes:', currentProject.notes)
        
        // Only update if the history has more notes or if it's a legitimate change
        if (historyState.notes.length > 0 || currentProject.notes.length === 0) {
          setCurrentProject(prev => prev ? {
            ...prev,
            notes: historyState.notes
          } : null)
          
          // Also update the page in the pages array
          setPages(prevPages => 
            prevPages.map((page, index) => 
              index === currentPageIndex 
                ? { ...page, notes: historyState.notes }
                : page
            )
          )
        } else {
          console.log('Skipping note update to prevent clearing notes')
        }
      }
      
      // Compare text elements by JSON string
      const currentTextElementsJson = JSON.stringify(textElements)
      const historyTextElementsJson = JSON.stringify(historyState.textElements)
      if (historyTextElementsJson !== currentTextElementsJson) {
        console.log('Updating text elements from history')
        setTextElements(historyState.textElements)
      }
      
      // Compare articulation elements by JSON string
      const currentArticulationElementsJson = JSON.stringify(articulationElements)
      const historyArticulationElementsJson = JSON.stringify(historyState.articulationElements)
      if (historyArticulationElementsJson !== currentArticulationElementsJson) {
        console.log('Updating articulation elements from history')
        console.log('Current articulations:', articulationElements.length, 'History articulations:', historyState.articulationElements.length)
        
        // Only update if the history has more articulations or if it's a legitimate change
        if (historyState.articulationElements.length > 0 || articulationElements.length === 0) {
          setArticulationElements(historyState.articulationElements)
        } else {
          console.log('Skipping articulation update to prevent clearing articulations')
        }
      }
    }
  }, [historyState, currentPageIndex])

  // Auto-save notes when they change
  useEffect(() => {
    if (currentProject && currentProjectId) {
      const timeoutId = setTimeout(async () => {
        console.log('Auto-saving notes:', currentProject.notes.length, 'articulations:', articulationElementsRef.current.length)
        saveNotes(currentProjectId, currentProject.notes)
        
        // Update the current page in the pages array with all current data
        const updatedPages = pages.map((page, index) => 
          index === currentPageIndex 
            ? { 
                ...page, 
                notes: currentProject.notes,
                textElements: textElements,
                articulationElements: articulationElementsRef.current,
            
                lyricElements: lyricElements,
                highlighterElements: highlighterElements
              }
            : page
        )
        
        console.log('Auto-saving pages with articulations:', updatedPages[currentPageIndex]?.articulationElements?.length || 0)
        
        // Save the updated pages to localStorage using the new function
        await saveProjectPages(currentProjectId, updatedPages)
        
        // Also update local localStorage for immediate access
        localStorage.setItem('projectPages', JSON.stringify(updatedPages))
        setPages(updatedPages)
        
        // Update project information in the projects list
        if (currentProject) {
          updateProject(currentProjectId, {
            noteCount: currentProject.notes.length,
            updatedAt: new Date()
          })
        }
      }, 5000) // Debounce for 5 seconds

      return () => clearTimeout(timeoutId)
    }
  }, [currentProject?.notes, currentProjectId, saveNotes, saveProjectPages, pages, currentPageIndex, updateProject]) // Removed problematic dependencies

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
    <div className="min-h-screen bg-white flex flex-col">
      <ProjectHeader 
        project={currentProject} 
        onTitleChange={(title) => handleUpdatePageSettings({ title })} 
        onBackToHome={handleBackToHome} 
        onLogout={handleLogout}
        scoreMode={scoreMode}
        onScoreModeChange={handleScoreModeChange}
      />
      <PageNavigation
        pages={pages}
        currentPageIndex={currentPageIndex}
        onPageChange={handlePageChange}
        onAddPage={handleAddPage}
        onRemovePage={handleRemovePage}
        scoreMode={scoreMode}
      />
      <div className="flex flex-1">
        <NotePalette
          selectedNotation={selectedNotation}
          onNotationSelect={setSelectedNotation}
        />
        {scoreMode === 'dnr' ? (
          <DNRScoresheet
            selectedNotation={selectedNotation}
            currentPage={currentProject}
            onAddNote={handleAddNote}
            onRemoveNote={handleRemoveNote}
            onUpdateNote={handleUpdateNote}
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
            lyricElements={lyricElements}
            onAddLyric={handleAddLyric}
            onRemoveLyric={handleRemoveLyric}
            onUpdateLyric={handleUpdateLyric}
            isLyricsMode={isLyricsMode}
            isHighlighterMode={isHighlighterMode}
            selectedHighlighterColor={selectedHighlighterColor}
            highlighterElements={highlighterElements}
            onAddHighlighter={handleAddHighlighter}
            onRemoveHighlighter={handleRemoveHighlighter}
            onUpdateHighlighter={handleUpdateHighlighter}
            layoutSettings={layoutSettings}
            onUpdateLayoutSettings={handleUpdateLayoutSettings}
            canUndo={canUndoAction}
            canRedo={canRedoAction}
            onUndo={undoAction}
            onRedo={redoAction}
            onAddPage={handleAddPage}
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
            lyricElements={lyricElements}
            onAddLyric={handleAddLyric}
            onRemoveLyric={handleRemoveLyric}
            onUpdateLyric={handleUpdateLyric}
            isLyricsMode={isLyricsMode}
            isHighlighterMode={isHighlighterMode}
            selectedHighlighterColor={selectedHighlighterColor}
            highlighterElements={highlighterElements}
            onAddHighlighter={handleAddHighlighter}
            onRemoveHighlighter={handleRemoveHighlighter}
            onUpdateHighlighter={handleUpdateHighlighter}

            layoutSettings={layoutSettings}
            onUpdateLayoutSettings={handleUpdateLayoutSettings}
            canUndo={canUndoAction}
            canRedo={canRedoAction}
            onUndo={undoAction}
            onRedo={redoAction}
            scoreMode={scoreMode}
            onAddPage={handleAddPage}
          />
        )}
        <RightSidebar
          selectedArticulation={selectedArticulation}
          onArticulationSelect={setSelectedArticulation}
          isTextMode={isTextMode}
          onTextModeToggle={setIsTextMode}
          currentPage={currentProject}
          lyricElements={lyricElements}
          onAddLyric={handleAddLyric}
          onRemoveLyric={handleRemoveLyric}
          onUpdateLyric={handleUpdateLyric}
          isLyricsMode={isLyricsMode}
          onLyricsModeToggle={setIsLyricsMode}
          isHighlighterMode={isHighlighterMode}
          onHighlighterModeToggle={setIsHighlighterMode}
          selectedHighlighterColor={selectedHighlighterColor}
          onHighlighterColorChange={setSelectedHighlighterColor}
          highlighterElements={highlighterElements}
          onAddHighlighter={handleAddHighlighter}
          onRemoveHighlighter={handleRemoveHighlighter}
          onUpdateHighlighter={handleUpdateHighlighter}
          layoutSettings={layoutSettings}
          onUpdateLayoutSettings={handleUpdateLayoutSettings}
        />
      </div>
    </div>
  )
}

export default App
