import React from 'react'
import { Music, FileText } from 'lucide-react'

export type ScoreMode = 'normal' | 'dnr'

interface ModeSelectorProps {
  currentMode: ScoreMode
  onModeChange: (mode: ScoreMode) => void
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-600">
      <span className="text-sm font-medium text-slate-300 px-2">Mode:</span>
      
      <button
        onClick={() => onModeChange('normal')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentMode === 'normal'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
        }`}
      >
        <Music className="w-4 h-4" />
        DNG
      </button>
      
      <button
        onClick={() => onModeChange('dnr')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentMode === 'dnr'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
        }`}
      >
        <FileText className="w-4 h-4" />
        DNR
      </button>
    </div>
  )
}

export default ModeSelector
