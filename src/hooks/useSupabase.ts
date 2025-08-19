import { useState, useEffect, useCallback } from 'react'
import { notePagesApi, notesApi } from '../lib/supabase'
import { type Notation } from '../data/notations'
import type { TextElement, ArticulationElement, LyricElement, HighlighterElement } from '../App'

export interface ProjectSummary {
  id: string
  title: string
  composer: string
  description?: string
  pageCount: number
  noteCount: number
  updatedAt: Date
  projectType: "DNG" | "DNR"
}

export interface PlacedNotation {
  id: string
  notation: Notation
  x: number
  y: number
  staveIndex: number
  octave: number
}

export interface ScorePage {
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
  textElements?: TextElement[]
  articulationElements?: ArticulationElement[]
  lyricElements?: LyricElement[]
  highlighterElements?: HighlighterElement[]
}

export const useSupabase = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load projects on component mount
  useEffect(() => {
    loadProjects()
  }, [])

  // Load all projects
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Temporarily bypass database - load from localStorage
      console.log('Bypassing database load - loading from localStorage')
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        // Convert dates back to Date objects
        const projectsWithDates = projects.map((project: any) => ({
          ...project,
          updatedAt: new Date(project.updatedAt)
        }))
        console.log('Loaded projects from localStorage:', projectsWithDates)
        setProjects(projectsWithDates)
      } else {
        console.log('No saved projects found, starting with empty list')
        setProjects([])
      }
      
      // Uncomment this when database is set up:
      /*
      const notePages = await notePagesApi.fetchAll()
      
      // Convert note pages to project summaries
      const projectSummaries: ProjectSummary[] = await Promise.all(
        notePages.map(async (page) => {
          try {
            const notes = await notesApi.fetchByPageId(page.id)
            
            return {
              id: page.id,
              title: page.title,
              composer: page.composer || 'Unknown Composer',
              description: page.description,
              pageCount: 1, // For now, each project is a single page
              noteCount: notes.length,
              updatedAt: new Date(page.created_at),
              projectType: page.project_type || 'DNG'
            }
          } catch (noteError) {
            console.error(`Error loading notes for project ${page.id}:`, noteError)
            return {
              id: page.id,
              title: page.title,
              composer: page.composer || 'Unknown Composer',
              description: page.description,
              pageCount: 1,
              noteCount: 0,
              updatedAt: new Date(page.created_at),
              projectType: page.project_type || 'DNG'
            }
          }
        })
      )
      
      setProjects(projectSummaries)
      */
    } catch (err) {
      console.error('Error loading projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new project
  const createProject = useCallback(async (
    title: string,
    composer: string,
    description?: string,
    projectType: "DNG" | "DNR" = "DNG"
  ): Promise<string | null> => {
    try {
      setError(null)
      
      // Temporarily bypass database for testing - create a local project
      const projectId = Date.now().toString()
      const newProject = {
        id: projectId,
        title: title,
        composer: composer || 'Unknown Composer',
        description: description || '',
        pageCount: 1,
        noteCount: 0,
        updatedAt: new Date(),
        projectType: projectType
      }
      
      console.log('Creating local project:', newProject)
      
      // Add to local projects list
      setProjects(prev => {
        const updatedProjects = [newProject, ...prev]
        // Save to localStorage
        localStorage.setItem('projects', JSON.stringify(updatedProjects))
        console.log('Saved projects to localStorage:', updatedProjects)
        return updatedProjects
      })
      
      return projectId
      
      // Uncomment this when database is set up:
      /*
      const newPage = await notePagesApi.create(title, composer, description, projectType)
      if (!newPage) {
        throw new Error('Failed to create project')
      }
      
      // Reload projects to include the new one
      await loadProjects()
      
      return newPage.id
      */
    } catch (err) {
      console.error('Error creating project:', err)
      setError('Failed to create project')
      return null
    }
  }, [])

  // Delete a project
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      setError(null)
      
      // Temporarily bypass database for testing - remove from local projects
      console.log('Deleting local project:', projectId)
      
      setProjects(prev => {
        const updatedProjects = prev.filter(project => project.id !== projectId)
        // Update localStorage
        localStorage.setItem('projects', JSON.stringify(updatedProjects))
        console.log('Updated projects in localStorage after deletion:', updatedProjects)
        return updatedProjects
      })
      
      return true
      
      // Uncomment this when database is set up:
      /*
      // Delete all notes for the project first
      await notesApi.deleteByPageId(projectId)
      
      // Delete the project page
      const success = await notePagesApi.delete(projectId)
      if (!success) {
        throw new Error('Failed to delete project')
      }
      
      // Reload projects to reflect the deletion
      await loadProjects()
      
      return true
      */
    } catch (err) {
      console.error('Error deleting project:', err)
      setError('Failed to delete project')
      return false
    }
  }, [])

  // Load a specific project/score page
  const loadScorePage = useCallback(async (projectId: string): Promise<ScorePage | null> => {
    try {
      setError(null)
      
      // Temporarily bypass database - return a default page
      const scorePage: ScorePage = {
        id: projectId,
        title: 'Default Project',
        notes: [],
        timeSignature: { numerator: 4, denominator: 4 },
        keySignature: 'C',
        tempo: 120,
        keyboardLineSpacing: 100,
        projectType: 'DNG'
      }
      
      console.log('Returning default score page:', scorePage)
      return scorePage
      
      // Uncomment this when database is set up:
      /*
      const notePage = await notePagesApi.fetchById(projectId)
      if (!notePage) {
        throw new Error('Project not found')
      }
      
      const notes = await notesApi.fetchByPageId(projectId)
      
      // Convert database notes to PlacedNotation format
      const placedNotes: PlacedNotation[] = notes.map((note) => {
        const notation = getNotationByKey(note.symbol)
        return {
          id: note.id,
          notation: notation || getNotationByKey('a')!, // Fallback to 'a' if symbol not found
          x: note.position_x,
          y: note.position_y,
          staveIndex: 0,
          octave: 4
        }
      })
      
      return {
        id: notePage.id,
        title: notePage.title,
        composer: notePage.composer,
        projectType: notePage.project_type as "DNG" | "DNR" || "DNG",
        notes: placedNotes,
        timeSignature: { numerator: 4, denominator: 4 }, // Default values
        keySignature: 'C',
        tempo: 120,
        keyboardLineSpacing: 108
      }
      */
    } catch (err) {
      console.error('Error loading score page:', err)
      setError('Failed to load score page')
      return null
    }
  }, [])

  // Save notes for a project
  const saveNotes = useCallback(async (
    projectId: string, 
    notes: PlacedNotation[]
  ): Promise<boolean> => {
    try {
      setError(null)
      
      console.log('saveNotes called with projectId:', projectId, 'notes count:', notes.length)
      
      // Temporarily bypass database - always return success
      console.log('Bypassing database save - returning success')
      return true
      
      // Uncomment this when database is set up:
      /*
      // Only save if we have notes to save
      if (notes.length === 0) {
        console.log('No notes to save, returning early')
        return true
      }
      
      // Delete existing notes for this project
      console.log('Deleting existing notes for project:', projectId)
      await notesApi.deleteByPageId(projectId)
      
      // Insert new notes
      console.log('Inserting', notes.length, 'new notes')
      const notePromises = notes.map(note => 
        notesApi.create(projectId, note.notation.alphabet, note.x, note.y)
      )
      
      await Promise.all(notePromises)
      console.log('Successfully saved all notes')
      
      return true
      */
    } catch (err) {
      console.error('Error saving notes:', err)
      setError('Failed to save notes')
      return false
    }
  }, [])

  // Add a single note
  const addNote = useCallback(async (
    projectId: string, 
    note: PlacedNotation
  ): Promise<PlacedNotation | null> => {
    try {
      setError(null)
      
      console.log('addNote called with projectId:', projectId, 'note:', note)
      
      // Temporarily bypass database for testing - return the note directly
      const result = {
        ...note,
        id: note.id || Date.now().toString()
      }
      console.log('Returning note with ID:', result.id)
      return result
      
      // Uncomment this when database is set up:
      /*
      const createdNote = await notesApi.create(
        projectId, 
        note.notation.alphabet, 
        note.x, 
        note.y
      )
      
      console.log('Database created note:', createdNote)
      
      if (createdNote) {
        // Return the note with the database-generated ID
        const result = {
          ...note,
          id: createdNote.id
        }
        console.log('Returning note with ID:', result.id)
        return result
      }
      
      console.log('No note created, returning null')
      return null
      */
    } catch (err) {
      console.error('Error adding note:', err)
      setError('Failed to add note')
      return null
    }
  }, [])

  // Remove a single note
  const removeNote = useCallback(async (
    projectId: string, 
    noteId: string
  ): Promise<boolean> => {
    try {
      setError(null)
      
      console.log('Attempting to delete note with ID:', noteId)
      
      // Temporarily bypass database - always return success
      console.log('Bypassing database delete - returning success')
      return true
      
      // Uncomment this when database is set up:
      /*
      const success = await notesApi.delete(noteId)
      console.log('Delete result:', success)
      return success
      */
    } catch (err) {
      console.error('Error removing note:', err)
      setError('Failed to remove note')
      return false
    }
  }, [])

  // Update project information
  const updateProject = useCallback(async (
    projectId: string,
    updates: Partial<ProjectSummary>
  ): Promise<boolean> => {
    try {
      setError(null)
      
      // Temporarily bypass database for testing - update local project
      console.log('Updating local project:', projectId, updates)
      
      setProjects(prev => {
        const updatedProjects = prev.map(project => 
          project.id === projectId 
            ? { ...project, ...updates, updatedAt: new Date() }
            : project
        )
        // Update localStorage
        localStorage.setItem('projects', JSON.stringify(updatedProjects))
        console.log('Updated projects in localStorage:', updatedProjects)
        return updatedProjects
      })
      
      return true
      
      // Uncomment this when database is set up:
      /*
      const success = await notePagesApi.update(projectId, updates)
      if (success) {
        await loadProjects()
      }
      return success
      */
    } catch (err) {
      console.error('Error updating project:', err)
      setError('Failed to update project')
      return false
    }
  }, [])

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return {
    projects,
    loading,
    error,
    createProject,
    deleteProject,
    updateProject,
    loadScorePage,
    saveNotes,
    addNote,
    removeNote,
    refreshProjects: loadProjects
  }
}
