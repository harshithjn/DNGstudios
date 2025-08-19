import React from 'react'
import { ArrowLeft, Music2, Keyboard, Mouse, Piano, Type, Pen, Download, RotateCcw, Settings, FileText, Star, Brain, Shield, Code, Play, Clock, Palette, Layers, Share2, Database, Cloud, Lock, Smartphone, Monitor } from 'lucide-react'

interface FeaturesPageProps {
  onBackToLanding: () => void
  onLaunchApp: () => void
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onBackToLanding, onLaunchApp }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            DNG Studios
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBackToLanding}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Back to Landing
          </button>
          <button 
            onClick={onLaunchApp}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Launch App</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Powerful Features for
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Traditional Music Notation
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover the comprehensive toolkit designed specifically for Indian classical music composition and notation.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Core Notation Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Keyboard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Input Note Placement</h3>
              <p className="text-gray-400 mb-4">
                Place notes using keyboard (a-z, A-Z), mouse clicks, or MIDI device input for maximum flexibility.
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Keyboard shortcuts for quick note entry</li>
                <li>• Mouse click placement anywhere on staff</li>
                <li>• MIDI device integration</li>
                <li>• Real-time visual feedback</li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">45+ Musical Symbols</h3>
              <p className="text-gray-400 mb-4">
                Comprehensive library of notes, rests, and musical symbols for complete notation.
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Complete note range (A-Z, a-z)</li>
                <li>• Various rest symbols</li>
                <li>• Musical notation marks</li>
                <li>• Traditional Indian symbols</li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Mouse className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Drag & Drop Interface</h3>
              <p className="text-gray-400 mb-4">
                Freely move notes horizontally and vertically across the canvas with intuitive drag controls.
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Free movement across staff</li>
                <li>• Visual drag indicators</li>
                <li>• Snap-to-grid options</li>
                <li>• Boundary constraints</li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Type className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rich Text Elements</h3>
              <p className="text-gray-400 mb-4">
                Add text annotations with customizable formatting and positioning.
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Customizable font sizes</li>
                <li>• Bold, italic, underline options</li>
                <li>• Drag and reposition text</li>
                <li>• Hover delete controls</li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Articulation Marks</h3>
              <p className="text-gray-400 mb-4">
                Add musical articulations including staccato, accent, fermata, and bar lines.
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Extensible bar lines</li>
                <li>• Double bar lines</li>
                <li>• Musical expression marks</li>
                <li>• Draggable positioning</li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Undo/Redo System</h3>
              <p className="text-gray-400 mb-4">
                Complete history tracking with keyboard shortcuts and visual feedback.
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Ctrl+Z (Undo), Ctrl+Y (Redo)</li>
                <li>• 50-state history limit</li>
                <li>• Visual button states</li>
                <li>• All actions tracked</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="px-6 py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Advanced Features</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Piano className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">MIDI Integration</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Connect MIDI devices for real-time note input and playback capabilities.
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Real-time MIDI input</li>
                  <li>• Virtual piano interface</li>
                  <li>• Audio preview support</li>
                  <li>• Device auto-detection</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Pen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Drawing Tools</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Freehand drawing and eraser tools for custom annotations and markings.
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Freehand pen tool</li>
                  <li>• Adjustable eraser size</li>
                  <li>• Custom annotations</li>
                  <li>• Drawing persistence</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Score Settings</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Customize time signatures, key signatures, and tempo with visual positioning.
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Multiple time signatures</li>
                  <li>• Key signature options</li>
                  <li>• Tempo control (40-240 BPM)</li>
                  <li>• Draggable positioning</li>
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Export & Sharing</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Export scores as high-resolution PDFs and share with others seamlessly.
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• High-resolution PDF export</li>
                  <li>• A4 format support</li>
                  <li>• Professional quality output</li>
                  <li>• Easy sharing options</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Cloud Storage</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Automatic cloud saving with real-time collaboration capabilities.
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Auto-save functionality</li>
                  <li>• Real-time collaboration</li>
                  <li>• Multiple project support</li>
                  <li>• Version history</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Cross-Platform</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Works seamlessly on desktop and mobile devices with responsive design.
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Responsive design</li>
                  <li>• Touch-friendly interface</li>
                  <li>• Mobile optimization</li>
                  <li>• Cross-browser support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DNR Mode Features */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">DNR Mode - Traditional Indian Music</h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Specialized for Indian Classical Music</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Music2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Swara Grid System</h4>
                    <p className="text-gray-400 text-sm">Complete 12-swara grid with Kannada notation support</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Raga Input Fields</h4>
                    <p className="text-gray-400 text-sm">Dedicated fields for raga, key signature, and time signature</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Traditional Layout</h4>
                    <p className="text-gray-400 text-sm">15-line staff system designed for Indian music notation</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Share2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cultural Integration</h4>
                    <p className="text-gray-400 text-sm">Seamless integration with Hamsalekha Vidya Samsthe traditions</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-8 h-80 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <Music2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>DNR Mode Interface</p>
                <p className="text-sm">(Image placeholder)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="px-6 py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Technical Excellence</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Positioning</h3>
              <p className="text-gray-400">
                Automatic line wrapping and measure calculation for professional notation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Data Security</h3>
              <p className="text-gray-400">
                SOC 2 certified with privacy options and secure cloud storage.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Modern Technology</h3>
              <p className="text-gray-400">
                Built with React, TypeScript, and Supabase for reliability and performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience These Features?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Start creating beautiful traditional Indian music notation with our comprehensive toolkit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onLaunchApp}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-medium"
            >
              <Play className="w-5 h-5" />
              <span>Launch DNG Studios</span>
            </button>
            <button 
              onClick={onBackToLanding}
              className="border border-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Landing</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
                DNG Studios
              </div>
              <p className="text-gray-400">
                The traditional Indian music notation editor with modern technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Core Notation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Advanced Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">DNR Mode</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">DNG Studios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hamsalekha Vidya Samsthe</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dr Hamsalekha</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Made by DNG Studios Team. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default FeaturesPage
