import { useState, useCallback } from 'react'
import type { ScorePage, PlacedNotation } from '../App'
import type { TextElement, ArticulationElement } from '../App'
import type { Lyric } from './useLyrics'

export interface PageData {
  id: string
  title: string
  notes: PlacedNotation[]
  textElements: TextElement[]
  articulationElements: ArticulationElement[]
  lyrics: Lyric[]
  timeSignature: { numerator: number; denominator: number }
  keySignature: string
  tempo: number
  keyboardLineSpacing: number
  keySignaturePosition?: { x: number; y: number }
  tempoPosition?: { x: number; y: number }
  timeSignaturePosition?: { x: number; y: number }
}

export function usePageManagement(initialPage?: ScorePage) {
  const [pages, setPages] = useState<PageData[]>(() => {
    if (initialPage) {
      return [{
        id: initialPage.id,
        title: initialPage.title,
        notes: initialPage.notes,
        textElements: [],
        articulationElements: [],
        lyrics: [],
        timeSignature: initialPage.timeSignature,
        keySignature: initialPage.keySignature,
        tempo: initialPage.tempo,
        keyboardLineSpacing: initialPage.keyboardLineSpacing || 108
      }]
    }
    return []
  })
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  const addPage = useCallback((title?: string) => {
    const newPage: PageData = {
      id: Date.now().toString(),
      title: title || `Page ${pages.length + 1}`,
      notes: [],
      textElements: [],
      articulationElements: [],
      lyrics: [],
      timeSignature: { numerator: 4, denominator: 4 },
      keySignature: 'C',
      tempo: 120,
      keyboardLineSpacing: 108
    }
    
    setPages(prev => [...prev, newPage])
    setCurrentPageIndex(pages.length)
    return newPage
  }, [pages.length])

  const removePage = useCallback((pageIndex: number) => {
    if (pages.length <= 1) return // Don't remove the last page
    
    setPages(prev => prev.filter((_, index) => index !== pageIndex))
    
    // Adjust current page index
    setCurrentPageIndex(prev => {
      if (prev >= pageIndex) {
        return Math.max(0, prev - 1)
      }
      return prev
    })
  }, [pages.length])

  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPageIndex(pageIndex)
    }
  }, [pages.length])

  const goToNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1)
    }
  }, [currentPageIndex, pages.length])

  const goToPreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1)
    }
  }, [currentPageIndex])

  const updateCurrentPage = useCallback((updates: Partial<PageData>) => {
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex ? { ...page, ...updates } : page
    ))
  }, [currentPageIndex])

  const getCurrentPage = useCallback(() => {
    return pages[currentPageIndex] || null
  }, [pages, currentPageIndex])

  const duplicatePage = useCallback((pageIndex: number) => {
    const pageToDuplicate = pages[pageIndex]
    if (!pageToDuplicate) return
    
    const duplicatedPage: PageData = {
      ...pageToDuplicate,
      id: Date.now().toString(),
      title: `${pageToDuplicate.title} (Copy)`
    }
    
    setPages(prev => [...prev, duplicatedPage])
    setCurrentPageIndex(pages.length)
  }, [pages])

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPages(prev => {
      const newPages = [...prev]
      const [movedPage] = newPages.splice(fromIndex, 1)
      newPages.splice(toIndex, 0, movedPage)
      return newPages
    })
    
    // Adjust current page index
    setCurrentPageIndex(prev => {
      if (prev === fromIndex) {
        return toIndex
      } else if (prev > fromIndex && prev <= toIndex) {
        return prev - 1
      } else if (prev < fromIndex && prev >= toIndex) {
        return prev + 1
      }
      return prev
    })
  }, [])

  return {
    pages,
    currentPageIndex,
    currentPage: getCurrentPage(),
    addPage,
    removePage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    updateCurrentPage,
    duplicatePage,
    reorderPages,
    canGoNext: currentPageIndex < pages.length - 1,
    canGoPrevious: currentPageIndex > 0,
    totalPages: pages.length
  }
}
