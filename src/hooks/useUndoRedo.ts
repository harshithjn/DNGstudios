import { useState, useCallback, useRef, useEffect } from 'react'

import type { PlacedNotation } from './useSupabase'
import type { TextElement, ArticulationElement } from '../App'

export interface HistoryState {
  notes: PlacedNotation[]
  textElements: TextElement[]
  articulationElements: ArticulationElement[]
  timestamp: number
}

export const useUndoRedo = (initialState: HistoryState) => {
  const [currentState, setCurrentState] = useState<HistoryState>(initialState)
  const [history, setHistory] = useState<HistoryState[]>([])
  const [future, setFuture] = useState<HistoryState[]>([])
  const maxHistorySize = useRef(50)
  const isInitialized = useRef(false)

  // Initialize with the initial state in history
  useEffect(() => {
    if (!isInitialized.current) {
      setHistory([initialState])
      isInitialized.current = true
    }
  }, [initialState])

  const pushState = useCallback((newState: HistoryState) => {
    console.log('Pushing state to history:', newState.notes.length, 'notes')
    // Always add current state to history before updating
    setHistory(prev => {
      const newHistory = [...prev, currentState].slice(-maxHistorySize.current)
      return newHistory
    })
    setCurrentState(newState)
    setFuture([]) // Clear future when new action is performed
  }, [currentState])

  const undo = useCallback(() => {
    console.log('Undo called, history length:', history.length)
    if (history.length === 0) {
      console.log('No history to undo')
      return
    }

    const previousState = history[history.length - 1]
    const newHistory = history.slice(0, -1)
    
    console.log('Undoing to state with:', previousState.notes.length, 'notes')
    setFuture(prev => [currentState, ...prev])
    setHistory(newHistory)
    setCurrentState(previousState)
  }, [history, currentState])

  const redo = useCallback(() => {
    console.log('Redo called, future length:', future.length)
    if (future.length === 0) {
      console.log('No future to redo')
      return
    }

    const nextState = future[0]
    const newFuture = future.slice(1)
    
    console.log('Redoing to state with:', nextState.notes.length, 'notes')
    setHistory(prev => [...prev, currentState])
    setFuture(newFuture)
    setCurrentState(nextState)
  }, [future, currentState])

  const canUndo = history.length > 0
  const canRedo = future.length > 0

  // Log state for debugging
  useEffect(() => {
    console.log('Undo/Redo state - canUndo:', canUndo, 'canRedo:', canRedo, 'history length:', history.length, 'future length:', future.length)
  }, [canUndo, canRedo, history.length, future.length])
  


  const reset = useCallback((newState: HistoryState) => {
    setCurrentState(newState)
    setHistory([])
    setFuture([])
    isInitialized.current = false
  }, [])

  return {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset
  }
}
