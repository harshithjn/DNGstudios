import React, { useState } from 'react'
import { ArrowRight, Code, Brain, Shield, Star, Users, Play, Music2, User, Mail, Linkedin, X } from 'lucide-react'

interface LandingPageProps {
  onLaunchApp: () => void
  onShowFeatures: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onShowFeatures }) => {
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center space-x-8">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Launch App</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center min-h-[80vh] flex items-center justify-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            The Desi
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Music Notation
            </span>
            <br />
            Editor
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Built to make you extraordinarily productive, DNG Studios is the best way to create traditional Indian music notation.
          </p>
          <div className="flex justify-center items-center">
            <button 
              onClick={onLaunchApp}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 text-lg font-medium shadow-lg shadow-blue-500/25"
            >
              <Play className="w-5 h-5" />
              <span>Launch DNG Studios</span>
              <ArrowRight className="w-5 h-5" />
            </button>
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
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Frontier Intelligence</h3>
              <p className="text-gray-400">
                Powered by a mix of purpose-built and frontier models, DNG Studios is smart and fast.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Feels Familiar</h3>
              <p className="text-gray-400">
                Import all your extensions, themes, and keybindings in one click.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Privacy Options</h3>
              <p className="text-gray-400">
                If you enable Privacy Mode, your music is never stored remotely without your consent. DNG Studios is SOC 2 certified.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start composing?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Experience the power of traditional Indian music notation with modern technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onLaunchApp}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-medium shadow-lg shadow-blue-500/25"
            >
              <Play className="w-5 h-5" />
              <span>Launch DNG Studios</span>
            </button>
            <button 
              onClick={() => setShowContactModal(true)}
              className="border border-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-medium"
            >
              <Users className="w-5 h-5" />
              <span>Contact Developer</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
                DNG Studios
              </div>
              <p className="text-gray-400">
                The traditional Indian music notation editor by DNG Studios that makes composition faster and more intuitive.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Downloads</a></li>
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
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Made by DNG Studios Team. All rights reserved.</p>
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
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
