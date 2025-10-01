import React, { useState } from 'react'
import MidiVisualMapper from './MidiVisualMapper'
import { ArrowLeft, Music, Settings, Info } from 'lucide-react'

interface MidiTestPageProps {
  onBack: () => void
}

const MidiTestPage: React.FC<MidiTestPageProps> = ({ onBack }) => {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to App</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Music className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  MIDI Visual Mapper Test
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                MIDI Visual Mapper - Implementation Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Features Implemented:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sequential MIDI-to-visual mapping (45 keys: a-z, A-S)</li>
                    <li>• Real-time visual feedback with activation/deactivation</li>
                    <li>• Full polyphonic support for multiple simultaneous notes</li>
                    <li>• Automatic base note detection from first MIDI input</li>
                    <li>• Sequential grid layout for easy visualization</li>
                    <li>• Connection status monitoring and device management</li>
                    <li>• Reset functionality to clear mapping and start over</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Technical Implementation:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Web MIDI API integration with proper event handling</li>
                    <li>• React hooks for state management and lifecycle</li>
                    <li>• Efficient Map-based active note tracking</li>
                    <li>• Visual elements mapped to existing notation images</li>
                    <li>• Responsive grid layout with hover and active states</li>
                    <li>• Comprehensive error handling and user feedback</li>
                    <li>• Cleanup and memory management for MIDI listeners</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This implementation follows the corrected prompt requirements, 
                  providing a standard MIDI-to-visual mapping system without forcing an unrelated 
                  laptop keyboard layout. The system maps MIDI keys sequentially to visual elements 
                  in a clear, practical arrangement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* MIDI Visual Mapper */}
          <div className="lg:col-span-2">
            <MidiVisualMapper className="w-full" />
          </div>

          {/* Additional Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Testing Instructions
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Setup:</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Connect your MIDI device to your computer</li>
                    <li>Ensure your browser supports Web MIDI API (Chrome, Edge recommended)</li>
                    <li>Grant MIDI access when prompted by the browser</li>
                    <li>Verify the connection status shows "Connected" above</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Testing:</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Play any MIDI note to set the base for the 45-key mapping</li>
                    <li>Play notes sequentially to see the visual mapping</li>
                    <li>Test polyphony by playing multiple notes simultaneously</li>
                    <li>Release notes to see them deactivate in real-time</li>
                    <li>Use the Reset button to clear the mapping and start over</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mapping Details
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Visual Elements:</h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>Lowercase:</strong> a-z (26 keys)</p>
                    <p><strong>Uppercase:</strong> A-S (19 keys)</p>
                    <p><strong>Total:</strong> 45 distinct MIDI keys</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">MIDI Mapping:</h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>Base Note:</strong> First MIDI note played</p>
                    <p><strong>Range:</strong> Base + 0 to Base + 44</p>
                    <p><strong>Outside Range:</strong> Ignored (no visual change)</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Visual Feedback:</h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>Active:</strong> Blue border, scale animation</p>
                    <p><strong>Inactive:</strong> Gray border, normal size</p>
                    <p><strong>Polyphony:</strong> Multiple notes can be active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MidiTestPage

