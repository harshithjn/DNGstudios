import React, { useState, useEffect, useCallback, useRef } from 'react'
import { notations, getNotationByKey } from '../data/notations'

interface MidiVisualMapperProps {
  className?: string
}

interface ActiveNote {
  midiNote: number
  visualElement: string
  timestamp: number
}

// Sequential mapping: a-z (26 keys) + A-S (19 keys) = 45 total keys
const VISUAL_ELEMENTS = [
  // Lowercase letters a-z (26 elements)
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  // Uppercase letters A-S (19 elements)
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'
]

const MidiVisualMapper: React.FC<MidiVisualMapperProps> = ({ className = '' }) => {
  const [activeNotes, setActiveNotes] = useState<Map<number, ActiveNote>>(new Map())
  const [lowestMidiNote, setLowestMidiNote] = useState<number | null>(null)
  const [midiInputs, setMidiInputs] = useState<MIDIInput[]>([])
  const [isMidiEnabled, setIsMidiEnabled] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected')
  
  // Ref to track the lowest MIDI note for mapping
  const lowestNoteRef = useRef<number | null>(null)

  // Create MIDI note to visual element mapping
  const createMidiMapping = useCallback((baseNote: number): Map<number, string> => {
    const mapping = new Map<number, string>()
    
    for (let i = 0; i < VISUAL_ELEMENTS.length; i++) {
      const midiNote = baseNote + i
      const visualElement = VISUAL_ELEMENTS[i]
      mapping.set(midiNote, visualElement)
    }
    
    return mapping
  }, [])

  // Get visual element for a MIDI note
  const getVisualElement = useCallback((midiNote: number): string | null => {
    if (lowestMidiNote === null) return null
    
    const mapping = createMidiMapping(lowestMidiNote)
    return mapping.get(midiNote) || null
  }, [lowestMidiNote, createMidiMapping])

  // Handle MIDI messages
  const handleMidiMessage = useCallback((event: MIDIMessageEvent) => {
    if (!event.data || event.data.length < 3) {
      console.warn("Invalid MIDI message data.")
      return
    }

    const status = event.data[0]
    const note = event.data[1]
    const velocity = event.data[2]

    const NOTE_ON = 0x90
    const NOTE_OFF = 0x80

    // Handle Note ON messages with velocity > 0
    if ((status & 0xf0) === NOTE_ON && velocity > 0) {
      // Set the lowest MIDI note on first note press
      if (lowestNoteRef.current === null) {
        lowestNoteRef.current = note
        setLowestMidiNote(note)
        console.log(`Lowest MIDI note set to: ${note}`)
      }

      const visualElement = getVisualElement(note)
      if (visualElement) {
        const activeNote: ActiveNote = {
          midiNote: note,
          visualElement,
          timestamp: Date.now()
        }
        
        setActiveNotes(prev => {
          const newMap = new Map(prev)
          newMap.set(note, activeNote)
          return newMap
        })
        
        console.log(`Note ON: MIDI ${note} -> Visual ${visualElement}`)
      } else {
        console.log(`MIDI note ${note} is outside the 45-key range`)
      }
    }
    
    // Handle Note OFF messages or Note ON with velocity 0
    if ((status & 0xf0) === NOTE_OFF || ((status & 0xf0) === NOTE_ON && velocity === 0)) {
      setActiveNotes(prev => {
        const newMap = new Map(prev)
        newMap.delete(note)
        return newMap
      })
      
      console.log(`Note OFF: MIDI ${note}`)
    }
  }, [getVisualElement])

  // Initialize MIDI
  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      console.warn("Web MIDI API is not supported in this browser.")
      setConnectionStatus('MIDI not supported')
      return
    }

    const enableMidi = async () => {
      try {
        const midiAccess = await navigator.requestMIDIAccess({ sysex: false })
        const inputs: MIDIInput[] = []

        // Enhanced MIDI input setup with better event handling
        midiAccess.inputs.forEach((input) => {
          inputs.push(input)

          // Remove any existing listeners to prevent duplicates
          input.removeEventListener("midimessage", handleMidiMessage)
          input.addEventListener("midimessage", handleMidiMessage)

          // Add connection state monitoring
          input.addEventListener("statechange", (e) => {
            const target = e.target as MIDIInput
            console.log(`MIDI Input ${target.name} state: ${target.state}`)
            if (target.state === "disconnected") {
              console.warn(`MIDI device ${target.name} disconnected`)
              setConnectionStatus('Device disconnected')
            } else if (target.state === "connected") {
              setConnectionStatus(`Connected: ${target.name}`)
            }
          })
        })

        setMidiInputs(inputs)
        setIsMidiEnabled(true)
        
        if (inputs.length > 0) {
          setConnectionStatus(`Connected: ${inputs[0].name}`)
        } else {
          setConnectionStatus('No MIDI devices found')
        }
        
        console.log(`MIDI enabled. ${inputs.length} input device(s) connected.`)

        // Monitor for new MIDI devices
        midiAccess.addEventListener("statechange", (e) => {
          const port = e.port as MIDIInput
          if (port.type === "input") {
            if (port.state === "connected") {
              console.log(`New MIDI input connected: ${port.name}`)
              port.addEventListener("midimessage", handleMidiMessage)
              setMidiInputs((prev) => [...prev.filter((input) => input.id !== port.id), port])
              setConnectionStatus(`Connected: ${port.name}`)
            } else if (port.state === "disconnected") {
              console.log(`MIDI input disconnected: ${port.name}`)
              setMidiInputs((prev) => prev.filter((input) => input.id !== port.id))
              if (inputs.length === 1) {
                setConnectionStatus('No MIDI devices connected')
              }
            }
          }
        })
      } catch (error) {
        console.error("Failed to enable MIDI:", error)
        setConnectionStatus('MIDI access denied')
      }
    }

    enableMidi()

    // Cleanup
    return () => {
      midiInputs.forEach(input => {
        input.removeEventListener("midimessage", handleMidiMessage)
      })
    }
  }, [handleMidiMessage, midiInputs])

  // Reset mapping when component unmounts or MIDI is disabled
  const resetMapping = useCallback(() => {
    setActiveNotes(new Map())
    setLowestMidiNote(null)
    lowestNoteRef.current = null
    console.log('MIDI mapping reset')
  }, [])

  // Get notation for visual element
  const getNotationForVisualElement = (visualElement: string) => {
    return getNotationByKey(visualElement)
  }

  // Render visual elements in a grid
  const renderVisualElements = () => {
    if (lowestMidiNote === null) {
      return (
        <div className="text-center text-gray-500 py-8">
          <p>Play any MIDI note to start mapping</p>
          <p className="text-sm mt-2">The first note will set the base for the 45-key range</p>
        </div>
      )
    }

    const mapping = createMidiMapping(lowestMidiNote)
    
    return (
      <div className="grid grid-cols-9 gap-2 p-4">
        {VISUAL_ELEMENTS.map((visualElement, index) => {
          const midiNote = lowestMidiNote + index
          const isActive = activeNotes.has(midiNote)
          const notation = getNotationForVisualElement(visualElement)
          
          return (
            <div
              key={`${midiNote}-${visualElement}`}
              className={`
                relative border-2 rounded-lg p-2 transition-all duration-200
                ${isActive 
                  ? 'border-blue-500 bg-blue-100 shadow-lg scale-110' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
            >
              {/* MIDI Note Number */}
              <div className="text-xs text-gray-600 mb-1 text-center">
                {midiNote}
              </div>
              
              {/* Visual Element */}
              <div className="text-center">
                {notation ? (
                  <img
                    src={notation.image}
                    alt={notation.name}
                    className="w-8 h-8 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 mx-auto bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
                    {visualElement}
                  </div>
                )}
              </div>
              
              {/* Visual Element Label */}
              <div className="text-xs text-center mt-1 font-mono">
                {visualElement}
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            MIDI Visual Mapper
          </h3>
          <div className="flex items-center space-x-4">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isMidiEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {connectionStatus}
            </div>
            <button
              onClick={resetMapping}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
        <div className="text-sm text-blue-800">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Connect your MIDI device and ensure it's detected above</li>
            <li>Play any MIDI note to set the base for the 45-key mapping</li>
            <li>Subsequent notes will map sequentially: a-z (26 keys) + A-S (19 keys)</li>
            <li>Active notes will be highlighted in blue with animation</li>
            <li>Supports polyphony - multiple notes can be active simultaneously</li>
          </ul>
        </div>
      </div>

      {/* Visual Elements Grid */}
      <div className="max-h-96 overflow-y-auto">
        {renderVisualElements()}
      </div>

      {/* Active Notes Summary */}
      {activeNotes.size > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            <strong>Active Notes:</strong> {activeNotes.size} 
            <span className="ml-2 text-gray-500">
              ({Array.from(activeNotes.values()).map(note => `${note.midiNote}→${note.visualElement}`).join(', ')})
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MidiVisualMapper

