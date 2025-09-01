"use client"

import type React from "react"
import { useState } from "react"
import { Type, Settings, Volume2, VolumeX, Play, Pause, Music, Edit, Trash2, Palette, Layout } from "lucide-react"
import type { ScorePage } from "../hooks/useSupabase"
import type { LyricElement, HighlighterElement, LayoutSettings } from "../App"

interface RightSidebarProps {
  selectedArticulation: string | null
  onArticulationSelect: (articulation: string) => void
  isTextMode: boolean
  onTextModeToggle: (enabled: boolean) => void
  currentPage: ScorePage

  lyricElements: LyricElement[]
  onAddLyric: (lyric: LyricElement) => void
  onRemoveLyric: (id: string) => void
  onUpdateLyric: (id: string, updates: Partial<LyricElement>) => void
  isLyricsMode: boolean
  onLyricsModeToggle: (enabled: boolean) => void
  isHighlighterMode: boolean
  onHighlighterModeToggle: (enabled: boolean) => void
  selectedHighlighterColor: 'red' | 'green' | 'blue' | 'yellow'
  onHighlighterColorChange: (color: 'red' | 'green' | 'blue' | 'yellow') => void
  highlighterElements: HighlighterElement[]

  onRemoveHighlighter: (id: string) => void

  layoutSettings: LayoutSettings
  onUpdateLayoutSettings: (settings: Partial<LayoutSettings>) => void
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
  selectedArticulation = null,
  onArticulationSelect = () => {},
  isTextMode = false,
  onTextModeToggle = () => {},
  currentPage = {} as ScorePage,

  lyricElements = [],
  onAddLyric = () => {},
  onRemoveLyric = () => {},
  onUpdateLyric = () => {},
  isLyricsMode = false,
  onLyricsModeToggle = () => {},
  isHighlighterMode = false,
  onHighlighterModeToggle = () => {},
  selectedHighlighterColor = 'yellow',
  onHighlighterColorChange = () => {},
  highlighterElements = [],

  onRemoveHighlighter = () => {},

  layoutSettings = {
    topMargin: 0.50,
    bottomMargin: 0.50,
    leftMargin: 0.50,
    rightMargin: 0.50,
    headerSpace: 1.00,
    lineDistance: 0.00,
    maxBarsPerLine: 0,
    constantSpacing: 16,
    proportionalSpacing: 16,
    slashSpacing: 16,
    beamingSlantFactor: 4,
    minSlant: 1,
    maxSlant: 4,
    defaultPedalPosition: 144,
    addBracketSpace: true,
    alternatingMargins: false,
    openSingleStaffs: false,
    justifyLastStaff: true,
    alternateRepeatSymbols: false,
    hideMutedNotes: false,
    hideMutedRegions: true,
    hideMutedTracks: false,
  },
  onUpdateLayoutSettings = () => {},
}) => {
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [metronomeInterval, setMetronomeInterval] = useState<ReturnType<typeof setInterval> | null>(null)

  const [showLyricsDialog, setShowLyricsDialog] = useState(false)
  const [editingLyric, setEditingLyric] = useState<LyricElement | null>(null)
  const [lyricText, setLyricText] = useState("")
  const [showLayoutSettings, setShowLayoutSettings] = useState(false)

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

  const handleAddLyric = () => {
    if (!lyricText.trim()) return
    
    const newLyric: LyricElement = {
      id: Date.now().toString(),
      noteId: "", // Will be set when clicking on a note
      text: lyricText,
      x: 200,
      y: 200,
      fontSize: 14,
    }
    
    onAddLyric(newLyric)
    setLyricText("")
    setShowLyricsDialog(false)
  }

  const handleEditLyric = (lyric: LyricElement) => {
    setEditingLyric(lyric)
    setLyricText(lyric.text)
    setShowLyricsDialog(true)
  }

  const handleSaveEdit = () => {
    if (!editingLyric || !lyricText.trim()) return
    
    onUpdateLyric(editingLyric.id, { text: lyricText })
    setEditingLyric(null)
    setLyricText("")
    setShowLyricsDialog(false)
  }

  const handleCancelEdit = () => {
    setEditingLyric(null)
    setLyricText("")
    setShowLyricsDialog(false)
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
        <p className="text-xs text-slate-400">Articulations, text tools, lyrics, drawing, and metronome</p>
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

        {/* Lyrics Tool */}
        <div className="border-b border-slate-700 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <Music className="h-4 w-4" />
            Lyrics Tool
          </h3>
          <button
            onClick={() => onLyricsModeToggle(!isLyricsMode)}
            className={`w-full rounded-lg border p-3 transition-all duration-200 ${
              isLyricsMode
                ? "border-green-500 bg-green-500/10 text-green-400"
                : "border-slate-600 bg-slate-800/50 text-white hover:border-slate-500 hover:bg-slate-700/50"
            }`}
          >
            <Music className="mx-auto mb-1 h-5 w-5" />
            <div className="text-sm font-medium">{isLyricsMode ? "Lyrics Mode ON" : "Enable Lyrics Mode"}</div>
            <div className="mt-1 text-xs text-slate-400">
              {isLyricsMode ? "Click on notes to add lyrics" : "Click to enable lyrics placement"}
            </div>
          </button>
          
          {/* Add Lyrics Button */}
          <button
            onClick={() => {
              setEditingLyric(null)
              setLyricText("")
              setShowLyricsDialog(true)
            }}
            className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800/50 p-2 text-white hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-200"
          >
            <div className="text-sm font-medium">Add New Lyrics</div>
          </button>

          {/* Lyrics List */}
          {lyricElements && lyricElements.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-slate-400 mb-2">Current Lyrics:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {lyricElements.map((lyric) => (
                  <div key={lyric.id} className="flex items-center justify-between bg-slate-800/30 rounded p-2">
                    <span className="text-xs text-white truncate flex-1">{lyric.text}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditLyric(lyric)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Edit lyrics"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveLyric(lyric.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete lyrics"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Layout Settings */}
        <div className="border-b border-slate-700 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <Layout className="h-4 w-4" />
            Layout Settings
          </h3>
          <button
            onClick={() => setShowLayoutSettings(true)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800/50 p-3 text-white hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-200"
          >
            <Layout className="mx-auto mb-1 h-5 w-5" />
            <div className="text-sm font-medium">Open Layout Settings</div>
            <div className="mt-1 text-xs text-slate-400">
              Configure margins, spacing, and display options
            </div>
          </button>
        </div>

        {/* Highlighter Tool */}
        <div className="border-b border-slate-700 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <Palette className="h-4 w-4" />
            Highlighter Tool
          </h3>
          <button
            onClick={() => onHighlighterModeToggle(!isHighlighterMode)}
            className={`w-full rounded-lg border p-3 transition-all duration-200 ${
              isHighlighterMode
                ? "border-green-500 bg-green-500/10 text-green-400"
                : "border-slate-600 bg-slate-800/50 text-white hover:border-slate-500 hover:bg-slate-700/50"
            }`}
          >
            <Palette className="mx-auto mb-1 h-5 w-5" />
            <div className="text-sm font-medium">{isHighlighterMode ? "Highlighter Mode ON" : "Enable Highlighter Mode"}</div>
            <div className="mt-1 text-xs text-slate-400">
              {isHighlighterMode ? "Click and drag to highlight areas" : "Click to enable highlighting"}
            </div>
          </button>
          
          {isHighlighterMode && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-slate-400 mb-2">Select Color:</h4>
              <div className="grid grid-cols-2 gap-2">
                {(['red', 'green', 'blue', 'yellow'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => onHighlighterColorChange(color)}
                    className={`p-2 rounded-lg border transition-all duration-200 ${
                      selectedHighlighterColor === color
                        ? "border-white shadow-lg"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    style={{
                      backgroundColor: color,
                      opacity: selectedHighlighterColor === color ? 1 : 0.7
                    }}
                  >
                    <span className="text-xs font-medium text-white capitalize">{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Highlighter List */}
          {highlighterElements && highlighterElements.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-slate-400 mb-2">Current Highlights:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {highlighterElements.map((highlighter) => (
                  <div key={highlighter.id} className="flex items-center justify-between bg-slate-800/30 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: highlighter.color }}
                      />
                      <span className="text-xs text-white">
                        {highlighter.color} highlight
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveHighlighter(highlighter.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete highlight"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* Lyrics Dialog */}
      {showLyricsDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-600">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  {editingLyric ? "Edit Lyrics" : "Add Lyrics"}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-slate-400 hover:text-white text-2xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Lyrics Text</label>
                  <input
                    type="text"
                    value={lyricText}
                    onChange={(e) => setLyricText(e.target.value)}
                    placeholder="Enter lyrics..."
                    className="w-full p-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingLyric ? handleSaveEdit : handleAddLyric}
                    disabled={!lyricText.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {editingLyric ? "Save Changes" : "Add Lyrics"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Settings Modal */}
      {showLayoutSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-slate-600">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Layout className="w-6 h-6" />
                  Layout Settings
                </h2>
                <button
                  onClick={() => setShowLayoutSettings(false)}
                  className="text-slate-400 hover:text-white text-2xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Margins and General Spacing */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
                    Margins and General Spacing
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Top Margin:</span>
                      <input
                        type="number"
                        step="0.01"
                        value={layoutSettings.topMargin}
                        onChange={(e) => onUpdateLayoutSettings({ topMargin: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400">cm</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Bottom Margin:</span>
                      <input
                        type="number"
                        step="0.01"
                        value={layoutSettings.bottomMargin}
                        onChange={(e) => onUpdateLayoutSettings({ bottomMargin: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400">cm</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Left Margin:</span>
                      <input
                        type="number"
                        step="0.01"
                        value={layoutSettings.leftMargin}
                        onChange={(e) => onUpdateLayoutSettings({ leftMargin: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400">cm</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Right Margin:</span>
                      <input
                        type="number"
                        step="0.01"
                        value={layoutSettings.rightMargin}
                        onChange={(e) => onUpdateLayoutSettings({ rightMargin: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400">cm</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Header Space:</span>
                      <input
                        type="number"
                        step="0.01"
                        value={layoutSettings.headerSpace}
                        onChange={(e) => onUpdateLayoutSettings({ headerSpace: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400">cm</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Line Distance:</span>
                      <input
                        type="number"
                        step="0.01"
                        value={layoutSettings.lineDistance}
                        onChange={(e) => onUpdateLayoutSettings({ lineDistance: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400">cm</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Max Bars/Line:</span>
                      <input
                        type="number"
                        value={layoutSettings.maxBarsPerLine}
                        onChange={(e) => onUpdateLayoutSettings({ maxBarsPerLine: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400">(0 = No Limit)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutSettings.addBracketSpace}
                        onChange={(e) => onUpdateLayoutSettings({ addBracketSpace: e.target.checked })}
                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">Add bracket space</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutSettings.alternatingMargins}
                        onChange={(e) => onUpdateLayoutSettings({ alternatingMargins: e.target.checked })}
                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">Alternating margins</span>
                    </label>
                  </div>
                </div>

                {/* Musical Spacing and Options */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
                    Musical Spacing and Options
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Constant Spacing:</span>
                      <input
                        type="number"
                        value={layoutSettings.constantSpacing}
                        onChange={(e) => onUpdateLayoutSettings({ constantSpacing: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400"></span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Proportional Spacing:</span>
                      <input
                        type="number"
                        value={layoutSettings.proportionalSpacing}
                        onChange={(e) => onUpdateLayoutSettings({ proportionalSpacing: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400"></span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Slash Spacing:</span>
                      <input
                        type="number"
                        value={layoutSettings.slashSpacing}
                        onChange={(e) => onUpdateLayoutSettings({ slashSpacing: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400"></span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Beaming Slant Factor:</span>
                      <input
                        type="number"
                        value={layoutSettings.beamingSlantFactor}
                        onChange={(e) => onUpdateLayoutSettings({ beamingSlantFactor: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400"></span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Minimum Slant:</span>
                      <input
                        type="number"
                        value={layoutSettings.minSlant}
                        onChange={(e) => onUpdateLayoutSettings({ minSlant: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400"></span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Maximum Slant:</span>
                      <input
                        type="number"
                        value={layoutSettings.maxSlant}
                        onChange={(e) => onUpdateLayoutSettings({ maxSlant: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400"></span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm font-medium text-slate-300">Default Pedal Position:</span>
                      <input
                        type="number"
                        value={layoutSettings.defaultPedalPosition}
                        onChange={(e) => onUpdateLayoutSettings({ defaultPedalPosition: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-400">(0 = Hide)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutSettings.openSingleStaffs}
                        onChange={(e) => onUpdateLayoutSettings({ openSingleStaffs: e.target.checked })}
                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">Open single staffs</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutSettings.justifyLastStaff}
                        onChange={(e) => onUpdateLayoutSettings({ justifyLastStaff: e.target.checked })}
                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">Justify last staff</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutSettings.alternateRepeatSymbols}
                        onChange={(e) => onUpdateLayoutSettings({ alternateRepeatSymbols: e.target.checked })}
                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">Alternate repeat symbols</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutSettings.hideMutedNotes}
                        onChange={(e) => onUpdateLayoutSettings({ hideMutedNotes: e.target.checked })}
                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">Hide muted notes</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutSettings.hideMutedRegions}
                        onChange={(e) => onUpdateLayoutSettings({ hideMutedRegions: e.target.checked })}
                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">Hide muted regions</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutSettings.hideMutedTracks}
                        onChange={(e) => onUpdateLayoutSettings({ hideMutedTracks: e.target.checked })}
                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">Hide muted tracks</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-600">
                <button
                  onClick={() => setShowLayoutSettings(false)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RightSidebar
