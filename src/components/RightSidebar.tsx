"use client"

import type React from "react"
import { useState } from "react"
import { Type, Settings, Volume2, VolumeX, Play, Pause, Eraser } from "lucide-react"
import type { ScorePage } from "../hooks/useSupabase"

interface RightSidebarProps {
  selectedArticulation: string | null
  onArticulationSelect: (articulation: string) => void
  isTextMode: boolean
  onTextModeToggle: (enabled: boolean) => void
  currentPage: ScorePage
  onUpdatePageSettings: (settings: Partial<ScorePage>) => void
}

const articulations = [
  { id: "staccato", name: "Staccato", symbol: "." },
  { id: "accent", name: "Accent", symbol: ">" },
  { id: "tenuto", name: "Tenuto", symbol: "—" },
  { id: "marcato", name: "Marcato", symbol: "^" },
  { id: "fermata", name: "Fermata", symbol: "𝄐" },
  { id: "trill", name: "Trill", symbol: "tr" },
  { id: "mordent", name: "Mordent", symbol: "𝄽" },
  { id: "turn", name: "Turn", symbol: "𝄾" },
  { id: "slur", name: "Slur", symbol: "⌒" },
  { id: "tie", name: "Tie", symbol: "⌒" },
  { id: "black-dot", name: "Black Dot", symbol: "●" },
  { id: "outline-dot", name: "Outline Dot", symbol: "○" },
]

const barLines = [
  { id: "bar-line", name: "Bar Line", symbol: "|", isExtensible: true },
  { id: "double-bar-line", name: "Double Bar Line", symbol: "||", isExtensible: true },
]

const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedArticulation,
  onArticulationSelect,
  isTextMode,
  onTextModeToggle,
  currentPage,
  
}) => {
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [metronomeInterval, setMetronomeInterval] = useState<ReturnType<typeof setInterval> | null>(null)

  const [activeTool, setActiveTool] = useState<"none" | "eraser">("none")
  const toggleEraser = () => {
    const next = activeTool === "eraser" ? "none" : "eraser"
    setActiveTool(next)
    if (next === "eraser" && isTextMode) onTextModeToggle(false)
    window.dispatchEvent(new CustomEvent("dng:tool", { detail: { tool: next } }))
  }

  const startMetronome = () => {
    if (metronomeInterval) {
      clearInterval(metronomeInterval)
    }

    const bpm = currentPage?.tempo || 120
    const intervalMs = (60 / bpm) * 1000

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

    const playClick = () => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }

    playClick()
    const interval = setInterval(playClick, intervalMs)
    setMetronomeInterval(interval)
    setMetronomeEnabled(true)
  }

  const stopMetronome = () => {
    if (metronomeInterval) {
      clearInterval(metronomeInterval)
      setMetronomeInterval(null)
    }
    setMetronomeEnabled(false)
  }

  const toggleMetronome = () => {
    if (metronomeEnabled) {
      stopMetronome()
    } else {
      startMetronome()
    }
  }

  return (
    <div className="flex h-screen w-64 flex-col border-l border-slate-700 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-700 p-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-blue-600 p-2">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">Tools & Settings</h2>
        </div>
        <p className="text-xs text-slate-400">Articulations, text tools, drawing, and metronome</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Bar Lines */}
        <div className="border-b border-slate-700 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <span className="text-lg">|</span>
            Bar Lines
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {barLines.map((barLine) => (
              <button
                key={barLine.id}
                onClick={() => onArticulationSelect(selectedArticulation === barLine.id ? "" : barLine.id)}
                className={`rounded-lg border p-3 text-center transition-all duration-200 ${
                  selectedArticulation === barLine.id
                    ? "border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/20"
                    : "border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700/50"
                }`}
              >
                <div className="mb-1 text-xl text-white">{barLine.symbol}</div>
                <div className="text-xs text-slate-400">{barLine.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Articulations */}
        <div className="border-b border-slate-700 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <span className="text-lg">♪</span>
            Articulations
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {articulations.map((articulation) => (
              <button
                key={articulation.id}
                onClick={() => onArticulationSelect(selectedArticulation === articulation.id ? "" : articulation.id)}
                className={`rounded-lg border p-3 text-center transition-all duration-200 ${
                  selectedArticulation === articulation.id
                    ? "border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/20"
                    : "border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700/50"
                }`}
              >
                <div className="mb-1 text-xl text-white">{articulation.symbol}</div>
                <div className="text-xs text-slate-400">{articulation.name}</div>
              </button>
            ))}
          </div>
          <div className="mt-3">
            <button
              onClick={() => onArticulationSelect("")}
              disabled={!selectedArticulation}
              className={`w-full rounded-md p-2 text-sm transition ${
                selectedArticulation
                  ? "border border-slate-600 text-white hover:bg-slate-700/50"
                  : "cursor-not-allowed border border-slate-700 text-slate-500"
              }`}
              aria-label="Deselect articulation"
              title="Deselect articulation"
            >
              Deselect articulation
            </button>
          </div>
        </div>

        {/* Text Tool */}
        <div className="border-b border-slate-700 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <Type className="h-4 w-4" />
            Text Tool
          </h3>
          <button
            onClick={() => onTextModeToggle(!isTextMode)}
            className={`w-full rounded-lg border p-3 transition-all duration-200 ${
              isTextMode
                ? "border-green-500 bg-green-500/10 text-green-400"
                : "border-slate-600 bg-slate-800/50 text-white hover:border-slate-500 hover:bg-slate-700/50"
            }`}
          >
            <Type className="mx-auto mb-1 h-5 w-5" />
            <div className="text-sm font-medium">{isTextMode ? "Text Mode ON" : "Enable Text Mode"}</div>
            <div className="mt-1 text-xs text-slate-400">
              {isTextMode ? "Click anywhere to add text" : "Click to enable text placement"}
            </div>
          </button>
        </div>



        {/* Metronome */}
        <div className="border-b border-slate-700 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            {metronomeEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Metronome
          </h3>
          <button
            onClick={toggleMetronome}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200 ${
              metronomeEnabled
                ? "border-green-500 bg-green-500/10 text-green-400"
                : "border-slate-600 bg-slate-800/50 text-white hover:border-slate-500 hover:bg-slate-700/50"
            }`}
          >
            {metronomeEnabled ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <div className="text-sm font-medium">{metronomeEnabled ? "Stop Metronome" : "Start Metronome"}</div>
          </button>
          <div className="mt-2 text-center text-xs text-slate-400">{currentPage?.tempo || 120} BPM</div>
        </div>
      </div>
    </div>
  )
}

export default RightSidebar
