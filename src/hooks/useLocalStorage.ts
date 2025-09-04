import { useState, useEffect, useCallback } from 'react'
import { type Notation, getNotationBySymbol } from '../data/notations'
import type { TextElement, ArticulationElement, LyricElement, HighlighterElement, DefaultBarLine } from '../App'

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
  flipped?: boolean
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
  defaultBarLines?: DefaultBarLine[]
}

export interface ProjectMetadata {
  textElements: TextElement[]
  articulationElements: ArticulationElement[]
  lyricElements: LyricElement[]
  highlighterElements: HighlighterElement[]
}

export const useLocalStorage = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all projects from localStorage
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading projects from localStorage...')
      const savedProjects = localStorage.getItem('dng_projects')
      
      if (savedProjects) {
        const projectData = JSON.parse(savedProjects)
        const projectSummaries: ProjectSummary[] = projectData.map((project: any) => ({
          id: project.id,
          title: project.title,
          composer: project.composer || 'Unknown Composer',
          description: project.description,
          pageCount: project.pages?.length || 1,
          noteCount: project.pages?.[0]?.notes?.length || 0,
          updatedAt: new Date(project.updatedAt || project.createdAt),
          projectType: project.projectType || 'DNG'
        }))
        
        console.log('Loaded projects from localStorage:', projectSummaries)
        setProjects(projectSummaries)
      } else {
        // Create sample projects if none exist
        const sampleProjects = [
          {
            id: 'sample-1',
            title: 'Sample DNG Project',
            composer: 'John Doe',
            description: 'A sample DNG project',
            projectType: 'DNG' as const,
            pages: [{
              id: 'sample-page-1',
              title: 'Page 1',
              notes: [],
              timeSignature: { numerator: 4, denominator: 4 },
              keySignature: 'C',
              tempo: 120,
              keyboardLineSpacing: 108,
              textElements: [],
              articulationElements: [],
              lyricElements: [],
              highlighterElements: [],
              defaultBarLines: []
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sample-2',
            title: 'Sample DNR Project',
            composer: 'Jane Smith',
            description: 'A sample DNR project',
            projectType: 'DNR' as const,
            pages: [{
              id: 'sample-page-2',
              title: 'Page 1',
              notes: [],
              timeSignature: { numerator: 4, denominator: 4 },
              keySignature: 'C',
              tempo: 120,
              keyboardLineSpacing: 108,
              textElements: [],
              articulationElements: [],
              lyricElements: [],
              highlighterElements: [],
              defaultBarLines: []
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        
        localStorage.setItem('dng_projects', JSON.stringify(sampleProjects))
        const projectSummaries: ProjectSummary[] = sampleProjects.map(project => ({
          id: project.id,
          title: project.title,
          composer: project.composer,
          description: project.description,
          pageCount: project.pages.length,
          noteCount: project.pages[0].notes.length,
          updatedAt: new Date(project.updatedAt),
          projectType: project.projectType
        }))
        
        setProjects(projectSummaries)
      }
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
      
      console.log('Creating project in localStorage...')
      const newProject = {
        id: Date.now().toString(),
        title,
        composer,
        description,
        projectType,
        pages: [{
          id: Date.now().toString() + '-page',
          title: 'Page 1',
          notes: [],
          timeSignature: { numerator: 4, denominator: 4 },
          keySignature: 'C',
          tempo: 120,
          keyboardLineSpacing: 108,
          textElements: [],
          articulationElements: [],
          lyricElements: [],
          highlighterElements: [],
          defaultBarLines: []
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const savedProjects = localStorage.getItem('dng_projects')
      const projects = savedProjects ? JSON.parse(savedProjects) : []
      projects.push(newProject)
      localStorage.setItem('dng_projects', JSON.stringify(projects))
      
      // Reload projects
      await loadProjects()
      
      console.log('Project created successfully:', newProject.id)
      return newProject.id
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
      
      console.log('Deleting project from localStorage:', projectId)
      const savedProjects = localStorage.getItem('dng_projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const filteredProjects = projects.filter((p: any) => p.id !== projectId)
        localStorage.setItem('dng_projects', JSON.stringify(filteredProjects))
        
        // Reload projects
        await loadProjects()
        return true
      }
      return false
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
      
      console.log('Loading score page from localStorage:', projectId)
      const savedProjects = localStorage.getItem('dng_projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const project = projects.find((p: any) => p.id === projectId)
        
        if (project && project.pages && project.pages.length > 0) {
          const page = project.pages[0] // For now, just use the first page
          
          // Convert stored notes to PlacedNotation format
          const placedNotes: PlacedNotation[] = (page.notes || []).map((note: any) => {
            const notation = getNotationBySymbol(note.symbol || 'a')
            return {
              id: note.id,
              notation: notation || getNotationBySymbol('a')!,
              x: note.x,
              y: note.y,
              staveIndex: note.staveIndex || 0,
              octave: note.octave || 4,
              flipped: note.flipped || false
            }
          })
          
          const scorePage: ScorePage = {
            id: page.id,
            title: page.title,
            notes: placedNotes,
            timeSignature: page.timeSignature || { numerator: 4, denominator: 4 },
            keySignature: page.keySignature || 'C',
            tempo: page.tempo || 120,
            keyboardLineSpacing: page.keyboardLineSpacing || 108,
            textElements: page.textElements || [],
            articulationElements: page.articulationElements || [],
            lyricElements: page.lyricElements || [],
            highlighterElements: page.highlighterElements || [],
            defaultBarLines: page.defaultBarLines || []
          }
          
          console.log('Returning score page from localStorage:', scorePage)
          return scorePage
        }
      }
      
      console.log('Project not found:', projectId)
      return null
    } catch (err) {
      console.error('Error loading score page:', err)
      setError('Failed to load score page')
      return null
    }
  }, [])

  // Load all pages for a project
  const loadProjectPages = useCallback(async (projectId: string): Promise<ScorePage[]> => {
    try {
      setError(null)
      
      console.log('Loading project pages from localStorage:', projectId)
      const savedProjects = localStorage.getItem('dng_projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const project = projects.find((p: any) => p.id === projectId)
        
        if (project && project.pages && project.pages.length > 0) {
          const scorePages: ScorePage[] = project.pages.map((page: any) => {
            // Convert stored notes to PlacedNotation format
            const placedNotes: PlacedNotation[] = (page.notes || []).map((note: any) => {
              const notation = getNotationBySymbol(note.symbol || 'a')
              return {
                id: note.id,
                notation: notation || getNotationBySymbol('a')!,
                x: note.x,
                y: note.y,
                staveIndex: note.staveIndex || 0,
                octave: note.octave || 4,
                flipped: note.flipped || false
              }
            })
            
            return {
              id: page.id,
              title: page.title,
              notes: placedNotes,
              timeSignature: page.timeSignature || { numerator: 4, denominator: 4 },
              keySignature: page.keySignature || 'C',
              tempo: page.tempo || 120,
              keyboardLineSpacing: page.keyboardLineSpacing || 108,
              textElements: page.textElements || [],
              articulationElements: page.articulationElements || [],
              lyricElements: page.lyricElements || [],
              highlighterElements: page.highlighterElements || [],
              defaultBarLines: page.defaultBarLines || []
            }
          })
          
          console.log('Returning project pages from localStorage:', scorePages)
          return scorePages
        }
      }
      
      console.log('Project not found:', projectId)
      return []
    } catch (err) {
      console.error('Error loading project pages:', err)
      setError('Failed to load project pages')
      return []
    }
  }, [])

  // Save all pages for a project
  const saveProjectPages = useCallback(async (projectId: string, pages: ScorePage[]): Promise<boolean> => {
    try {
      setError(null)
      
      console.log('Saving project pages to localStorage:', projectId, pages.length)
      const savedProjects = localStorage.getItem('dng_projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const projectIndex = projects.findIndex((p: any) => p.id === projectId)
        
        if (projectIndex !== -1) {
          // Convert ScorePage[] to storage format
          const storagePages = pages.map(page => ({
            id: page.id,
            title: page.title,
            notes: page.notes.map(note => ({
              id: note.id,
              symbol: note.notation.symbol,
              x: note.x,
              y: note.y,
              staveIndex: note.staveIndex,
              octave: note.octave,
              flipped: note.flipped || false
            })),
            timeSignature: page.timeSignature,
            keySignature: page.keySignature,
            tempo: page.tempo,
            keyboardLineSpacing: page.keyboardLineSpacing,
            textElements: page.textElements || [],
            articulationElements: page.articulationElements || [],
            lyricElements: page.lyricElements || [],
            highlighterElements: page.highlighterElements || [],
            defaultBarLines: page.defaultBarLines || []
          }))
          
          projects[projectIndex].pages = storagePages
          projects[projectIndex].updatedAt = new Date().toISOString()
          
          localStorage.setItem('dng_projects', JSON.stringify(projects))
          console.log('Project pages saved successfully to localStorage')
          return true
        }
      }
      
      console.log('Project not found for saving pages:', projectId)
      return false
    } catch (err) {
      console.error('Error saving project pages:', err)
      setError('Failed to save project pages')
      return false
    }
  }, [])

  // Save notes for a project
  const saveNotes = useCallback(async (projectId: string, notes: PlacedNotation[]): Promise<boolean> => {
    try {
      setError(null)
      
      console.log('Saving notes to localStorage:', projectId, notes.length)
      const savedProjects = localStorage.getItem('dng_projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const projectIndex = projects.findIndex((p: any) => p.id === projectId)
        
        if (projectIndex !== -1 && projects[projectIndex].pages && projects[projectIndex].pages.length > 0) {
          // Convert PlacedNotation to storage format
          const storageNotes = notes.map(note => ({
            id: note.id,
            symbol: note.notation.symbol,
            x: note.x,
            y: note.y,
            staveIndex: note.staveIndex,
            octave: note.octave,
            flipped: note.flipped || false
          }))
          
          projects[projectIndex].pages[0].notes = storageNotes
          projects[projectIndex].updatedAt = new Date().toISOString()
          
          localStorage.setItem('dng_projects', JSON.stringify(projects))
          console.log('Notes saved successfully to localStorage')
          return true
        }
      }
      
      console.log('Project not found for saving notes:', projectId)
      return false
    } catch (err) {
      console.error('Error saving notes:', err)
      setError('Failed to save notes')
      return false
    }
  }, [])

  // Add a note to a project
  const addNote = useCallback(async (projectId: string, note: PlacedNotation): Promise<PlacedNotation | null> => {
    try {
      setError(null)
      
      console.log('Adding note to localStorage:', projectId, note)
      const savedProjects = localStorage.getItem('dng_projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const projectIndex = projects.findIndex((p: any) => p.id === projectId)
        
        if (projectIndex !== -1 && projects[projectIndex].pages && projects[projectIndex].pages.length > 0) {
          const newNote = {
            id: note.id,
            symbol: note.notation.symbol,
            x: note.x,
            y: note.y,
            staveIndex: note.staveIndex,
            octave: note.octave,
            flipped: note.flipped || false
          }
          
          projects[projectIndex].pages[0].notes.push(newNote)
          projects[projectIndex].updatedAt = new Date().toISOString()
          
          localStorage.setItem('dng_projects', JSON.stringify(projects))
          console.log('Note added successfully to localStorage')
          return note
        }
      }
      
      console.log('Project not found for adding note:', projectId)
      return null
    } catch (err) {
      console.error('Error adding note:', err)
      setError('Failed to add note')
      return null
    }
  }, [])

  // Remove a note from a project
  const removeNote = useCallback(async (projectId: string, noteId: string): Promise<boolean> => {
    try {
      setError(null)
      
      console.log('Removing note from localStorage:', projectId, noteId)
      const savedProjects = localStorage.getItem('dng_projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const projectIndex = projects.findIndex((p: any) => p.id === projectId)
        
        if (projectIndex !== -1 && projects[projectIndex].pages && projects[projectIndex].pages.length > 0) {
          projects[projectIndex].pages[0].notes = projects[projectIndex].pages[0].notes.filter((n: any) => n.id !== noteId)
          projects[projectIndex].updatedAt = new Date().toISOString()
          
          localStorage.setItem('dng_projects', JSON.stringify(projects))
          console.log('Note removed successfully from localStorage')
          return true
        }
      }
      
      console.log('Project not found for removing note:', projectId)
      return false
    } catch (err) {
      console.error('Error removing note:', err)
      setError('Failed to remove note')
      return false
    }
  }, [])

  // Update project metadata
  const updateProject = useCallback(async (projectId: string, updates: Partial<ProjectSummary>): Promise<boolean> => {
    try {
      setError(null)
      
      console.log('Updating project in localStorage:', projectId, updates)
      const savedProjects = localStorage.getItem('dng_projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const projectIndex = projects.findIndex((p: any) => p.id === projectId)
        
        if (projectIndex !== -1) {
          projects[projectIndex] = { ...projects[projectIndex], ...updates }
          projects[projectIndex].updatedAt = new Date().toISOString()
          
          localStorage.setItem('dng_projects', JSON.stringify(projects))
          console.log('Project updated successfully in localStorage')
          return true
        }
      }
      
      console.log('Project not found for updating:', projectId)
      return false
    } catch (err) {
      console.error('Error updating project:', err)
      setError('Failed to update project')
      return false
    }
  }, [])

  // Save project metadata (text elements, articulations, etc.)
  const saveProjectMetadata = useCallback(async (projectId: string, metadata: ProjectMetadata): Promise<boolean> => {
    try {
      setError(null)
      
      console.log('Saving project metadata to localStorage:', projectId, metadata)
      const savedProjects = localStorage.getItem('dng_projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const projectIndex = projects.findIndex((p: any) => p.id === projectId)
        
        if (projectIndex !== -1 && projects[projectIndex].pages && projects[projectIndex].pages.length > 0) {
          projects[projectIndex].pages[0].textElements = metadata.textElements
          projects[projectIndex].pages[0].articulationElements = metadata.articulationElements
          projects[projectIndex].pages[0].lyricElements = metadata.lyricElements
          projects[projectIndex].pages[0].highlighterElements = metadata.highlighterElements
          projects[projectIndex].updatedAt = new Date().toISOString()
          
          localStorage.setItem('dng_projects', JSON.stringify(projects))
          console.log('Project metadata saved successfully to localStorage')
          return true
        }
      }
      
      console.log('Project not found for saving metadata:', projectId)
      return false
    } catch (err) {
      console.error('Error saving project metadata:', err)
      setError('Failed to save project metadata')
      return false
    }
  }, [])

  // Load project metadata
  const loadProjectMetadata = useCallback(async (projectId: string): Promise<ProjectMetadata | null> => {
    try {
      setError(null)
      
      console.log('Loading project metadata from localStorage:', projectId)
      const savedProjects = localStorage.getItem('dng_projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const project = projects.find((p: any) => p.id === projectId)
        
        if (project && project.pages && project.pages.length > 0) {
          const page = project.pages[0]
          const metadata: ProjectMetadata = {
            textElements: page.textElements || [],
            articulationElements: page.articulationElements || [],
            lyricElements: page.lyricElements || [],
            highlighterElements: page.highlighterElements || []
          }
          
          console.log('Project metadata loaded from localStorage:', metadata)
          return metadata
        }
      }
      
      console.log('Project not found for loading metadata:', projectId)
      return null
    } catch (err) {
      console.error('Error loading project metadata:', err)
      setError('Failed to load project metadata')
      return null
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
    loadProjects,
    createProject,
    deleteProject,
    loadScorePage,
    loadProjectPages,
    saveProjectPages,
    saveNotes,
    addNote,
    removeNote,
    updateProject,
    saveProjectMetadata,
    loadProjectMetadata
  }
}
