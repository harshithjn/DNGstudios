"use client"

import React, { useState } from "react"
import { Settings, X } from "lucide-react"

interface LayoutSettingsProps {
  isOpen: boolean
  onClose: () => void
  layoutSettings: LayoutSettings
  onUpdateSettings: (settings: Partial<LayoutSettings>) => void
}

export interface LayoutSettings {
  // Margins
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
  
  // Spacing
  headerSpace: number
  lineDistance: number
  maxBarsPerLine: number
  
  // Musical spacing
  constantSpacing: number
  proportionalSpacing: number
  slashSpacing: number
  
  // Beaming
  beamingSlantFactor: number
  minSlant: number
  maxSlant: number
  
  // Pedal
  defaultPedalPosition: number
  
  // Options
  addBracketSpace: boolean
  alternatingMargins: boolean
  openSingleStaffs: boolean
  justifyLastStaff: boolean
  alternateRepeatSymbols: boolean
  hideMutedNotes: boolean
  hideMutedRegions: boolean
  hideMutedTracks: boolean
}

const LayoutSettings: React.FC<LayoutSettingsProps> = ({
  isOpen,
  onClose,
  layoutSettings,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<LayoutSettings>(layoutSettings)

  const handleSave = () => {
    onUpdateSettings(localSettings)
    onClose()
  }

  const handleCancel = () => {
    setLocalSettings(layoutSettings)
    onClose()
  }

  const updateSetting = (key: keyof LayoutSettings, value: number | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Layout Settings
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Margins and General Spacing */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Margins and General Spacing
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Top Margin:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={localSettings.topMargin}
                    onChange={(e) => updateSetting('topMargin', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">cm</span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Bottom Margin:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={localSettings.bottomMargin}
                    onChange={(e) => updateSetting('bottomMargin', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">cm</span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Left Margin:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={localSettings.leftMargin}
                    onChange={(e) => updateSetting('leftMargin', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">cm</span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Right Margin:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={localSettings.rightMargin}
                    onChange={(e) => updateSetting('rightMargin', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">cm</span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Header Space:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={localSettings.headerSpace}
                    onChange={(e) => updateSetting('headerSpace', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">cm</span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Line Distance:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={localSettings.lineDistance}
                    onChange={(e) => updateSetting('lineDistance', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">cm</span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Max Bars/Line:</span>
                  <input
                    type="number"
                    value={localSettings.maxBarsPerLine}
                    onChange={(e) => updateSetting('maxBarsPerLine', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">(0 = No Limit)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.addBracketSpace}
                    onChange={(e) => updateSetting('addBracketSpace', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Add bracket space</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.alternatingMargins}
                    onChange={(e) => updateSetting('alternatingMargins', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Alternating margins</span>
                </label>
              </div>
            </div>

            {/* Musical Spacing and Options */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Musical Spacing and Options
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Constant Spacing:</span>
                  <input
                    type="number"
                    value={localSettings.constantSpacing}
                    onChange={(e) => updateSetting('constantSpacing', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500"></span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Proportional Spacing:</span>
                  <input
                    type="number"
                    value={localSettings.proportionalSpacing}
                    onChange={(e) => updateSetting('proportionalSpacing', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500"></span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Slash Spacing:</span>
                  <input
                    type="number"
                    value={localSettings.slashSpacing}
                    onChange={(e) => updateSetting('slashSpacing', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500"></span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Beaming Slant Factor:</span>
                  <input
                    type="number"
                    value={localSettings.beamingSlantFactor}
                    onChange={(e) => updateSetting('beamingSlantFactor', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500"></span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Minimum Slant:</span>
                  <input
                    type="number"
                    value={localSettings.minSlant}
                    onChange={(e) => updateSetting('minSlant', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500"></span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Maximum Slant:</span>
                  <input
                    type="number"
                    value={localSettings.maxSlant}
                    onChange={(e) => updateSetting('maxSlant', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500"></span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">Default Pedal Position:</span>
                  <input
                    type="number"
                    value={localSettings.defaultPedalPosition}
                    onChange={(e) => updateSetting('defaultPedalPosition', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">(0 = Hide)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.openSingleStaffs}
                    onChange={(e) => updateSetting('openSingleStaffs', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Open single staffs</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.justifyLastStaff}
                    onChange={(e) => updateSetting('justifyLastStaff', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Justify last staff</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.alternateRepeatSymbols}
                    onChange={(e) => updateSetting('alternateRepeatSymbols', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Alternate repeat symbols</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.hideMutedNotes}
                    onChange={(e) => updateSetting('hideMutedNotes', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Hide muted notes</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.hideMutedRegions}
                    onChange={(e) => updateSetting('hideMutedRegions', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Hide muted regions</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.hideMutedTracks}
                    onChange={(e) => updateSetting('hideMutedTracks', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Hide muted tracks</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              Save Settings
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LayoutSettings
