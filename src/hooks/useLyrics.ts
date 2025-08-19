import { useState, useCallback } from 'react'

export interface Lyric {
  id: string
  noteId: string
  text: string
  x: number
  y: number
  fontSize: number
  bold: boolean
  italic: boolean
}

export function useLyrics() {
  const [lyrics, setLyrics] = useState<Lyric[]>([])
  const [showLyricsDialog, setShowLyricsDialog] = useState(false)
  const [lyricsDialogPosition, setLyricsDialogPosition] = useState({ x: 0, y: 0 })
  const [editingLyricId, setEditingLyricId] = useState<string | null>(null)
  const [newLyricText, setNewLyricText] = useState('')
  const [newLyricSize, setNewLyricSize] = useState(14)
  const [newLyricBold, setNewLyricBold] = useState(false)
  const [newLyricItalic, setNewLyricItalic] = useState(false)

  const addLyric = useCallback((noteId: string, text: string, x: number, y: number, fontSize: number = 14, bold: boolean = false, italic: boolean = false) => {
    const newLyric: Lyric = {
      id: Date.now().toString(),
      noteId,
      text,
      x,
      y,
      fontSize,
      bold,
      italic
    }
    setLyrics(prev => [...prev, newLyric])
    return newLyric
  }, [])

  const updateLyric = useCallback((lyricId: string, updates: Partial<Lyric>) => {
    setLyrics(prev => prev.map(lyric => 
      lyric.id === lyricId ? { ...lyric, ...updates } : lyric
    ))
  }, [])

  const removeLyric = useCallback((lyricId: string) => {
    setLyrics(prev => prev.filter(lyric => lyric.id !== lyricId))
  }, [])

  const removeLyricsForNote = useCallback((noteId: string) => {
    setLyrics(prev => prev.filter(lyric => lyric.noteId !== noteId))
  }, [])

  const getLyricsForNote = useCallback((noteId: string) => {
    return lyrics.filter(lyric => lyric.noteId === noteId)
  }, [lyrics])

  const openLyricsDialog = useCallback((noteId: string, x: number, y: number, existingLyric?: Lyric) => {
    setLyricsDialogPosition({ x, y })
    if (existingLyric) {
      setEditingLyricId(existingLyric.id)
      setNewLyricText(existingLyric.text)
      setNewLyricSize(existingLyric.fontSize)
      setNewLyricBold(existingLyric.bold)
      setNewLyricItalic(existingLyric.italic)
    } else {
      setEditingLyricId(null)
      setNewLyricText('')
      setNewLyricSize(14)
      setNewLyricBold(false)
      setNewLyricItalic(false)
    }
    setShowLyricsDialog(true)
  }, [])

  const closeLyricsDialog = useCallback(() => {
    setShowLyricsDialog(false)
    setEditingLyricId(null)
    setNewLyricText('')
    setNewLyricSize(14)
    setNewLyricBold(false)
    setNewLyricItalic(false)
  }, [])

  const saveLyric = useCallback((noteId: string) => {
    if (!newLyricText.trim()) return

    if (editingLyricId) {
      updateLyric(editingLyricId, {
        text: newLyricText,
        fontSize: newLyricSize,
        bold: newLyricBold,
        italic: newLyricItalic
      })
    } else {
      addLyric(noteId, newLyricText, lyricsDialogPosition.x, lyricsDialogPosition.y, newLyricSize, newLyricBold, newLyricItalic)
    }
    
    closeLyricsDialog()
  }, [editingLyricId, newLyricText, newLyricSize, newLyricBold, newLyricItalic, lyricsDialogPosition, addLyric, updateLyric, closeLyricsDialog])

  return {
    lyrics,
    showLyricsDialog,
    lyricsDialogPosition,
    editingLyricId,
    newLyricText,
    newLyricSize,
    newLyricBold,
    newLyricItalic,
    addLyric,
    updateLyric,
    removeLyric,
    removeLyricsForNote,
    getLyricsForNote,
    openLyricsDialog,
    closeLyricsDialog,
    saveLyric,
    setNewLyricText,
    setNewLyricSize,
    setNewLyricBold,
    setNewLyricItalic
  }
}
