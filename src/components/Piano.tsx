"use client"
import type React from "react"
import { X } from "lucide-react"

interface PianoProps {
  isOpen: boolean
  onClose: () => void
}

const Piano: React.FC<PianoProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const generateKeys = () => {
    const whiteKeyPattern = ["C", "D", "E", "F", "G", "A", "B"]
    const blackKeyPattern = [
      { note: "C#", position: 0.5 },
      { note: "D#", position: 1.5 },
      { note: "F#", position: 3.5 },
      { note: "G#", position: 4.5 },
      { note: "A#", position: 5.5 },
    ]

    const lowercaseLabels = "abcdefghijklmnopqrstuvwxyz".split("")
    const uppercaseLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

    const whiteKeys = []
    const blackKeys = []

    const octaves = [1, 2, 3, 4, 5, 6, 7, 8]
    let whiteKeyIndex = 0

    // Generate white keys with a–z then A–Z labels
    for (const octave of octaves) {
      for (let i = 0; i < whiteKeyPattern.length; i++) {
        if (octave === 8 && i > 2) break

        let displayLabel
        if (whiteKeyIndex < 26) {
          displayLabel = lowercaseLabels[whiteKeyIndex]
        } else {
          displayLabel = uppercaseLabels[(whiteKeyIndex - 26) % uppercaseLabels.length]
        }

        whiteKeys.push({
          note: `${whiteKeyPattern[i]}${octave}`,
          displayNote: displayLabel,
          octave,
          index: whiteKeyIndex,
        })
        whiteKeyIndex++
      }
    }

    // Generate black keys (no labels)
    whiteKeyIndex = 0
    for (const octave of octaves) {
      for (const blackKey of blackKeyPattern) {
        if (octave === 8) break
        blackKeys.push({
          note: `${blackKey.note}${octave}`,
          displayNote: "",
          octave,
          position: whiteKeyIndex + blackKey.position,
        })
      }
      whiteKeyIndex += 7
    }

    return { whiteKeys, blackKeys }
  }

  const { whiteKeys, blackKeys } = generateKeys()

  const playNote = (note: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    const getFrequency = (note: string) => {
      const noteFrequencies: { [key: string]: number } = {
        C: 16.35,
        "C#": 17.32,
        D: 18.35,
        "D#": 19.45,
        E: 20.6,
        F: 21.83,
        "F#": 23.12,
        G: 24.5,
        "G#": 25.96,
        A: 27.5,
        "A#": 29.14,
        B: 30.87,
      }

      const match = note.match(/([A-G]#?)(\d+)/)
      if (!match) return 440
      const [, noteName, octaveStr] = match
      const octave = Number.parseInt(octaveStr)
      const baseFreq = noteFrequencies[noteName]
      return baseFreq * Math.pow(2, octave)
    }

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(getFrequency(note), audioContext.currentTime)
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-7xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Virtual Piano</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Piano Keys */}
        <div className="relative bg-gray-800 p-4 rounded-lg overflow-x-auto">
          <div className="flex relative min-w-max">
            {/* White Keys */}
            {whiteKeys.map((key) => (
              <button
                key={key.note}
                onClick={() => playNote(key.note)}
                className="w-10 h-32 bg-white border border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors flex flex-col items-center justify-center pb-2 text-base font-medium text-gray-700"
                style={{ marginRight: "1px" }}
              >
                {key.displayNote}
              </button>
            ))}

            {/* Black Keys */}
            {blackKeys.map((key) => (
              <button
                key={key.note}
                onClick={() => playNote(key.note)}
                className="absolute w-7 h-20 bg-gray-900 hover:bg-gray-800 active:bg-gray-700 transition-colors"
                style={{
                  left: `${key.position * 41 - 14}px`,
                  zIndex: 10,
                }}
              />
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center text-gray-300 text-sm">
            Click on the keys to play notes • Scroll horizontally to see all keys
          </div>
        </div>
      </div>
    </div>
  )
}

export default Piano
