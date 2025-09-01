"use client"

import type React from "react"
import { useState } from "react"
import { Music4, Search } from "lucide-react"

interface StemSidebarProps {
  selectedStem: string | null
  onStemSelect: (stem: string) => void
}

const StemSidebar: React.FC<StemSidebarProps> = ({ selectedStem, onStemSelect }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCase, setShowCase] = useState<"capital" | "small" | "all">("all")

  // All available stem images
  const capitalStems = Array.from({ length: 19 }, (_, i) => {
    const letter = String.fromCharCode(65 + i) // A=65, S=83
    return `Capital ${letter}.png`
  })

  const smallStems = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(97 + i) // a=97, z=122
    return `Small ${letter}.png`
  })

  const getFilteredStems = () => {
    let filtered: string[] = []

    if (showCase === "capital") {
      filtered = capitalStems
    } else if (showCase === "small") {
      filtered = smallStems
    } else {
      filtered = [...capitalStems, ...smallStems]
    }

    if (searchTerm) {
      filtered = filtered.filter((stem) =>
        stem.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Music4 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">Stem Images</h2>
        </div>
        <p className="text-xs text-slate-400">Select stem images to place on the score</p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter by Case */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setShowCase("all")}
            className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all duration-200 ${
              showCase === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setShowCase("capital")}
            className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all duration-200 ${
              showCase === "capital"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            A-S
          </button>
          <button
            onClick={() => setShowCase("small")}
            className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all duration-200 ${
              showCase === "small"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            a-z
          </button>
        </div>
      </div>

      {/* Stems - Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Music4 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Stem Images ({getFilteredStems().length})</h3>
          </div>

          {getFilteredStems().map((stem) => (
            <button
              key={stem}
              onClick={() => onStemSelect(stem)}
              className={`w-full p-3 rounded-lg border transition-all duration-200 hover:shadow-md group ${
                selectedStem === stem
                  ? "border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/20"
                  : "border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                    <img
                      src={`/Stem/${stem}`}
                      alt={stem}
                      className="w-[60px] h-[60px] object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white text-sm">{stem.replace('.png', '')}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Click to select</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedStem === stem && (
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  )}
                </div>
              </div>
            </button>
          ))}

          {getFilteredStems().length === 0 && (
            <div className="text-center py-8">
              <Music4 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No stems found</p>
              <p className="text-slate-500 text-xs">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions - Fixed at bottom */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <Music4 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">How to Use</h3>
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Select a stem image from the list above</div>
            <div>• Click anywhere on the score to place it</div>
            <div>• Drag to move, resize, or delete as needed</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StemSidebar
