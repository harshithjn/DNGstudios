import { createClient } from '@supabase/supabase-js'

// Hardcoded Supabase keys as requested
const supabaseUrl = 'https://esthiwvrzgfbvcndmeft.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdGhpd3ZyemdmYnZjbmRtZWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzI0ODAsImV4cCI6MjA3MDQwODQ4MH0.KkrVzvGsNCT-a_dWU7oHIPCq6dWQeWKnn9Rux1ooSdM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface NotePage {
  id: string
  title: string
  composer?: string
  description?: string
  project_type?: string
  created_at: string
}

export interface Note {
  id: string
  page_id: string
  symbol: string
  position_x: number
  position_y: number
  created_at: string
}

// CRUD functions for note pages
export const notePagesApi = {
  // Create a new note page
  async create(
    title: string, 
    composer?: string, 
    description?: string, 
    projectType?: string
  ): Promise<NotePage | null> {
    try {
      const { data, error } = await supabase
        .from('note_pages')
        .insert([{ 
          title, 
          composer: composer || 'Unknown Composer',
          description,
          project_type: projectType || 'DNG'
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating note page:', error)
        if (error.code === 'PGRST205') {
          console.error('Table note_pages does not exist. Please run the database schema first.')
        }
        return null
      }
      
      return data
    } catch (err) {
      console.error('Unexpected error creating note page:', err)
      return null
    }
  },

  // Fetch all note pages
  async fetchAll(): Promise<NotePage[]> {
    try {
      const { data, error } = await supabase
        .from('note_pages')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching note pages:', error)
        if (error.code === 'PGRST205') {
          console.error('Table note_pages does not exist. Please run the database schema first.')
        }
        return []
      }
      
      return data || []
    } catch (err) {
      console.error('Unexpected error fetching note pages:', err)
      return []
    }
  },

  // Fetch a single note page by ID
  async fetchById(id: string): Promise<NotePage | null> {
    const { data, error } = await supabase
      .from('note_pages')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching note page:', error)
      return null
    }
    
    return data
  },

  // Update a note page
  async update(id: string, updates: Partial<NotePage>): Promise<NotePage | null> {
    const { data, error } = await supabase
      .from('note_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating note page:', error)
      return null
    }
    
    return data
  },

  // Delete a note page
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('note_pages')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting note page:', error)
      return false
    }
    
    return true
  }
}

// CRUD functions for notes
export const notesApi = {
  // Create a new note
  async create(pageId: string, symbol: string, positionX: number, positionY: number): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        page_id: pageId,
        symbol,
        position_x: positionX,
        position_y: positionY
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating note:', error)
      return null
    }
    
    return data
  },

  // Fetch all notes for a page
  async fetchByPageId(pageId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('page_id', pageId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching notes:', error)
      return []
    }
    
    return data || []
  },

  // Update a note
  async update(id: string, updates: Partial<Note>): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating note:', error)
      return null
    }
    
    return data
  },

  // Delete a note
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting note:', error)
      return false
    }
    
    return true
  },

  // Delete all notes for a page
  async deleteByPageId(pageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('page_id', pageId)
    
    if (error) {
      console.error('Error deleting notes by page ID:', error)
      return false
    }
    
    return true
  }
}
