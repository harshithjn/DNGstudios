import React, { useState } from 'react'
import { Code, Brain, Shield, Play, User, Mail, Linkedin, X, Music } from 'lucide-react'

interface LandingPageProps {
  onLaunchApp: () => void
  onShowFeatures: () => void
  onShowMidiTest: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onShowFeatures, onShowMidiTest }) => {
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold text-blue-400">
            DNG Studios
          </div>
          <div className="hidden md:flex space-x-6">
            <button 
              onClick={onShowFeatures}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onLaunchApp}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Launch App</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center min-h-[80vh] flex items-center justify-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="text-blue-400">DNG Studios</span>
            <br />
            Music Notation
          </h1>
          <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
            Professional music notation for traditional Indian compositions.
          </p>
          <div className="flex justify-center items-center space-x-4">
            <button 
              onClick={onLaunchApp}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 text-lg font-medium"
            >
              <Play className="w-5 h-5" />
              <span>Get Started</span>
            </button>
            <button 
              onClick={onShowMidiTest}
              className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center space-x-2 text-lg font-medium"
            >
              <Music className="w-5 h-5" />
              <span>MIDI Test</span>
            </button>
          </div>
        </div>
      </section>





      {/* Laptop Mockup Section */}
      <section className="px-6 py-16 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center">
            {/* Laptop Mockup */}
            <div className="relative">
              {/* Laptop Base */}
              <div className="w-[600px] h-[375px] md:w-[800px] md:h-[500px] bg-gray-800 rounded-lg shadow-2xl relative">
                {/* Screen */}
                <div className="absolute top-3 left-3 right-3 bottom-3 md:top-4 md:left-4 md:right-4 md:bottom-4 bg-gray-900 rounded-lg overflow-hidden">
                  {/* Screen Content */}
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    {/* Mockup Image */}
                    <img 
                      src="/images/mockup.png" 
                      alt="DNG Studios Interface Mockup" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Laptop Hinge */}
                <div className="absolute -top-1 md:-top-2 left-1/2 transform -translate-x-1/2 w-12 h-3 md:w-16 md:h-4 bg-gray-700 rounded-t-lg"></div>
              </div>
              
              {/* Laptop Stand/Base */}
              <div className="absolute -bottom-6 md:-bottom-8 left-1/2 transform -translate-x-1/2 w-[700px] h-6 md:w-[900px] md:h-8 bg-gray-700 rounded-lg shadow-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Dr Hamsalekha Section */}
      <section className="px-6 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">About Dr Hamsalekha</h2>
              <p className="text-xl text-gray-400 mb-6">
                Dr Hamsalekha is a renowned musicologist, composer, and educator who has dedicated his life to the study and preservation of Indian classical music.
              </p>
              <p className="text-lg text-gray-300 mb-6">
                With decades of experience in music composition and education, Dr Hamsalekha has been instrumental in developing innovative approaches to music notation and teaching methodologies.
              </p>
              <p className="text-lg text-gray-300">
                His contributions to the field of Indian music have earned him recognition as one of the leading authorities in traditional music notation and composition.
              </p>
            </div>
            <div className="h-80 flex items-center justify-center overflow-hidden">
              <img 
                src="images/sir.jpg" 
                alt="Dr Hamsalekha" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Hamsalekha Vidya Samsthe Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 md:order-1 h-80 flex items-center justify-center overflow-hidden">
              <img 
                src="images/hms1.jpg" 
                alt="Hamsalekha Vidya Samsthe" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold mb-6">About Hamsalekha Vidya Samsthe</h2>
              <p className="text-xl text-gray-400 mb-6">
                Hamsalekha Vidya Samsthe is a prestigious music institution dedicated to the preservation and propagation of Indian classical music traditions.
              </p>
              <p className="text-lg text-gray-300">
                Founded with the vision of nurturing musical talent and preserving the rich heritage of Indian music, the institution has been at the forefront of music education and cultural preservation for decades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About DNG Studios Section */}
      <section className="px-6 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold mb-6">About DNG Studios</h2>
              <p className="text-xl text-gray-400 mb-6">
                DNG Studios is a pioneering music technology company dedicated to preserving and promoting traditional Indian music through innovative digital solutions.
              </p>
              <p className="text-lg text-gray-300">
                We specialize in creating cutting-edge tools that bridge the gap between traditional music notation and modern technology, making it easier for musicians to compose, learn, and share their music.
              </p>
            </div>
            <div className="h-80 flex items-center justify-center overflow-hidden">
              <img 
                src="images/hms.jpg" 
                alt="DNG Studios" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Smart Notation</h3>
              <p className="text-gray-400 text-sm">
                Intelligent music notation with traditional Indian music support.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Easy to Use</h3>
              <p className="text-gray-400 text-sm">
                Intuitive interface designed for musicians and composers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Professional</h3>
              <p className="text-gray-400 text-sm">
                Export high-quality scores and compositions.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Start Composing</h2>
          <p className="text-lg text-gray-400 mb-8">
            Create beautiful music notation with DNG Studios.
          </p>
          <button 
            onClick={onLaunchApp}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 text-lg font-medium"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xl font-bold text-blue-400 mb-2">
            DNG Studios
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Professional music notation for traditional Indian compositions.
          </p>
          <div className="text-gray-500 text-xs">
            © 2024 DNG Studios. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Contact Developer Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-gray-700 relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Harshith J</h3>
              <p className="text-gray-400">Developer & Creator</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">workwithharshith@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <Linkedin className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">LinkedIn</p>
                  <p className="text-white">harshithj</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400 text-center">
                Get in touch for collaborations, feedback, or questions about DNG Studios.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



export default LandingPage
