import { supabase } from './supabase'

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    
    // Test fetching note_pages
    const { data: pages, error: pagesError } = await supabase
      .from('note_pages')
      .select('*')
      .limit(1)
    
    if (pagesError) {
      console.error('❌ Error fetching note_pages:', pagesError)
      return false
    }
    
    console.log('✅ Successfully connected to note_pages table')
    console.log('📊 Found', pages?.length || 0, 'projects')
    
    // Test fetching notes
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .limit(1)
    
    if (notesError) {
      console.error('❌ Error fetching notes:', notesError)
      return false
    }
    
    console.log('✅ Successfully connected to notes table')
    console.log('📊 Found', notes?.length || 0, 'notes')
    
    console.log('🎉 Supabase connection test passed!')
    return true
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error)
    return false
  }
}
