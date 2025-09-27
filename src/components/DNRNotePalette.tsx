"use client"

import type React from "react"
import { useState } from "react"
import { Music, Circle, Music4, Keyboard, Search } from "lucide-react"
import { dnrNotations, getDNRLowercaseNotations, getDNRUppercaseNotations, type DNRNotation } from "../data/dnrNotations"
import type { Notation } from "../data/notations"

interface DNRNotePaletteProps {
  selectedNotation: Notation | null
  onNotationSelect: (notation: Notation) => void
}

const DNRNotePalette: React.FC<DNRNotePaletteProps> = ({ 
  selectedNotation, 
  onNotationSelect
}) => {
  const [showCase, setShowCase] = useState<"lowercase" | "uppercase" | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getFilteredNotations = () => {
    let filtered = dnrNotations

    if (showCase === "lowercase") {
      filtered = getDNRLowercaseNotations()
    } else if (showCase === "uppercase") {
      filtered = getDNRUppercaseNotations()
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (notation) =>
          notation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notation.alphabet.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Music className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">DNR Notation Palette</h2>
        </div>
        <p className="text-xs text-slate-400">Select DNR notations and press keyboard keys to place them</p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search DNR notations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter by Case */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setShowCase("all")}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
              showCase === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setShowCase("lowercase")}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
              showCase === "lowercase"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            Lower
          </button>
          <button
            onClick={() => setShowCase("uppercase")}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
              showCase === "uppercase"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            Upper
          </button>
        </div>
      </div>

      {/* Notations - Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Music4 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">DNR Notations ({getFilteredNotations().length})</h3>
          </div>

          {getFilteredNotations().map((notation) => (
            <button
              key={notation.id}
              onClick={() => {
                onNotationSelect(notation)
                console.log("DNR Notation selected:", notation.name, notation.alphabet)
              }}
              className={`w-full p-3 rounded-lg border transition-all duration-200 hover:shadow-sm group ${
                selectedNotation?.id === notation.id
                  ? "border-blue-500 bg-blue-500/10 shadow-sm shadow-blue-500/20"
                  : "border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-slate-300 shadow-sm">
                  <img
                    src={notation.image}
                    alt={notation.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      // Fallback to a music note icon if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement?.appendChild(
                        Object.assign(document.createElement('div'), {
                          className: 'w-8 h-8 flex items-center justify-center text-slate-400',
                          innerHTML: '♪'
                        })
                      )
                    }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-lg font-bold text-white group-hover:text-white">
                    {notation.name.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-400">
                    Press <kbd className="px-1 py-0.5 bg-slate-700 rounded font-mono text-xs">{notation.alphabet}</kbd>
                  </div>
                </div>
                {selectedNotation?.id === notation.id && (
                  <Circle className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcut Info - Fixed at bottom */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <Keyboard className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">DNR Keyboard Shortcuts</h3>
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <div>
              • Press <kbd className="px-1 py-0.5 bg-slate-700 rounded font-mono">a-z</kbd> for lowercase DNR notations
            </div>
            <div>
              • Press <kbd className="px-1 py-0.5 bg-slate-700 rounded font-mono">A-Z</kbd> for uppercase DNR notations
            </div>
            <div>• DNR notations are placed automatically on the DNR scoresheet</div>
            <div>• When keyboard is off, click on DNR scoresheet to place selected notation</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DNRNotePalette
