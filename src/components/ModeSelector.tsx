import React from 'react'
import { Music, FileText } from 'lucide-react'

export type ScoreMode = 'normal' | 'dnr'

interface ModeSelectorProps {
  currentMode: ScoreMode
  onModeChange: (mode: ScoreMode) => void
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
      <span className="text-sm font-medium text-gray-700 mr-2">Mode:</span>
      
      <button
        onClick={() => onModeChange('normal')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentMode === 'normal'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Music className="w-4 h-4" />
        DNG
      </button>
      
      <button
        onClick={() => onModeChange('dnr')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentMode === 'dnr'
            ? 'bg-purple-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <FileText className="w-4 h-4" />
        DNR
      </button>
    </div>
  )
}

export default ModeSelector
