import React, { useState } from 'react'
import { Lock, Music } from 'lucide-react'

interface AuthProps {
  onAuthenticated: () => void
}

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const CORRECT_PIN = '1234'

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4) // Only allow digits, max 4
    setPin(value)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate a brief loading delay for better UX
    setTimeout(() => {
      if (pin === CORRECT_PIN) {
        onAuthenticated()
      } else {
        setError('Incorrect PIN. Please try again.')
        setPin('')
      }
      setIsLoading(false)
    }, 300)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as React.FormEvent)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">DNG Music</h1>
          <p className="text-gray-600">Enter your 4-digit PIN to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-center mb-4">
              <div className="flex gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      pin.length > index
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <input
              type="password"
              value={pin}
              onChange={handlePinChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter 4-digit PIN"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              maxLength={4}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-600 text-center text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length !== 4 || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              pin.length === 4 && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Unlock
              </div>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Default PIN: 1234
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
