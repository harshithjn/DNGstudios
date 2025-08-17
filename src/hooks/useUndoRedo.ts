import { useState, useCallback, useRef } from 'react'

export interface HistoryState<T> {
  id: string
  timestamp: number
  data: T
}

export function useUndoRedo<T>(
  initialState: T,
  maxHistorySize: number = 50
) {
  const [currentState, setCurrentState] = useState<T>(initialState)
  const [history, setHistory] = useState<HistoryState<T>[]>([
    { id: Date.now().toString(), timestamp: Date.now(), data: initialState }
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const isUndoRedoAction = useRef(false)

  const pushState = useCallback((newState: T) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false
      return
    }

    const newHistoryState: HistoryState<T> = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      data: newState
    }

    setHistory(prevHistory => {
      // Remove any states after current index (for redo)
      const trimmedHistory = prevHistory.slice(0, currentIndex + 1)
      
      // Add new state
      const updatedHistory = [...trimmedHistory, newHistoryState]
      
      // Limit history size
      if (updatedHistory.length > maxHistorySize) {
        return updatedHistory.slice(-maxHistorySize)
      }
      
      return updatedHistory
    })

    setCurrentIndex(prevIndex => {
      const newIndex = Math.min(prevIndex + 1, maxHistorySize - 1)
      return newIndex
    })

    setCurrentState(newState)
  }, [currentIndex, maxHistorySize])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedoAction.current = true
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setCurrentState(history[newIndex].data)
    }
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedoAction.current = true
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setCurrentState(history[newIndex].data)
    }
  }, [currentIndex, history])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  const reset = useCallback((newInitialState: T) => {
    const newHistoryState: HistoryState<T> = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      data: newInitialState
    }
    
    setHistory([newHistoryState])
    setCurrentIndex(0)
    setCurrentState(newInitialState)
    isUndoRedoAction.current = false
  }, [])

  return {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    historyLength: history.length,
    currentIndex
  }
}
