"use client"

import React, { useState } from "react"
import { Lock, Music } from "lucide-react"

interface AuthProps {
  onAuthenticated: () => void
}

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const CORRECT_PIN = "1234"

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
    setPin(value)
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      if (pin === CORRECT_PIN) {
        onAuthenticated()
      } else {
        setError("Incorrect PIN. Please try again.")
        setPin("")
      }
      setIsLoading(false)
    }, 300)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as React.FormEvent)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow background circles */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-600 rounded-full blur-[120px] opacity-40" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-600 rounded-full blur-[120px] opacity-40" />

      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.4)] p-8 w-full max-w-md backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(139,92,246,0.7)]">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            DNG Music
          </h1>
          <p className="text-gray-400">Enter your 4-digit PIN to continue</p>
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
                        ? "bg-purple-500 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.9)]"
                        : "border-gray-600"
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
              placeholder="••••"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none placeholder-gray-500"
              maxLength={4}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-center text-sm bg-red-900/30 p-3 rounded-lg border border-red-700/40">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length !== 4 || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              pin.length === 4 && !isLoading
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-[0_0_20px_rgba(139,92,246,0.7)]"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
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
      </div>
    </div>
  )
}

export default Auth
