import { useState, useEffect, useCallback } from 'react'
import { notePagesApi, notesApi } from '../lib/supabase'
import { getNotationByKey, type Notation } from '../data/notations'

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
}

export const useSupabase = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all projects
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const notePages = await notePagesApi.fetchAll()
      
      // Convert note pages to project summaries
      const projectSummaries: ProjectSummary[] = await Promise.all(
        notePages.map(async (page) => {
          try {
            const notes = await notesApi.fetchByPageId(page.id)
            
            return {
              id: page.id,
              title: page.title,
              composer: 'Unknown Composer', // You can add composer field to note_pages table if needed
              description: undefined,
              pageCount: 1, // For now, each project is a single page
              noteCount: notes.length,
              updatedAt: new Date(page.created_at),
              projectType: 'DNG' as const // Default to DNG, you can add this field to note_pages table
            }
          } catch (noteError) {
            console.error(`Error loading notes for project ${page.id}:`, noteError)
            return {
              id: page.id,
              title: page.title,
              composer: 'Unknown Composer',
              description: undefined,
              pageCount: 1,
              noteCount: 0,
              updatedAt: new Date(page.created_at),
              projectType: 'DNG' as const
            }
          }
        })
      )
      
      setProjects(projectSummaries)
    } catch (err) {
      console.error('Error loading projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new project
  const createProject = useCallback(async (
    title: string
  ): Promise<string | null> => {
    try {
      setError(null)
      
      const newPage = await notePagesApi.create(title)
      if (!newPage) {
        throw new Error('Failed to create project')
      }
      
      // Reload projects to include the new one
      await loadProjects()
      
      return newPage.id
    } catch (err) {
      console.error('Error creating project:', err)
      setError('Failed to create project')
      return null
    }
  }, [loadProjects])

  // Delete a project
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      setError(null)
      
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
    } catch (err) {
      console.error('Error deleting project:', err)
      setError('Failed to delete project')
      return false
    }
  }, [loadProjects])

  // Load a specific project/score page
  const loadScorePage = useCallback(async (projectId: string): Promise<ScorePage | null> => {
    try {
      setError(null)
      
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
        notes: placedNotes,
        timeSignature: { numerator: 4, denominator: 4 }, // Default values
        keySignature: 'C',
        tempo: 120,
        keyboardLineSpacing: 108
      }
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
      
      // Delete existing notes for this project
      await notesApi.deleteByPageId(projectId)
      
      // Insert new notes
      const notePromises = notes.map(note => 
        notesApi.create(projectId, note.notation.alphabet, note.x, note.y)
      )
      
      await Promise.all(notePromises)
      
      return true
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
  ): Promise<boolean> => {
    try {
      setError(null)
      
      const success = await notesApi.create(
        projectId, 
        note.notation.alphabet, 
        note.x, 
        note.y
      )
      
      return !!success
    } catch (err) {
      console.error('Error adding note:', err)
      setError('Failed to add note')
      return false
    }
  }, [])

  // Remove a single note
  const removeNote = useCallback(async (
    projectId: string, 
    noteId: string
  ): Promise<boolean> => {
    try {
      setError(null)
      
      const success = await notesApi.delete(noteId)
      return success
    } catch (err) {
      console.error('Error removing note:', err)
      setError('Failed to remove note')
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
    loadScorePage,
    saveNotes,
    addNote,
    removeNote,
    refreshProjects: loadProjects
  }
}
