'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function StickyWaitlist() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setEmail('')
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setIsVisible(false)
        }, 5000)
      } else {
        setError(data.error || 'Something unexpected happened! Please try again.')
      }
    } catch (err) {
      setError('Something unexpected happened! Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
      <div className="glass-effect rounded-2xl p-6 backdrop-blur-sm border border-white/10">
        {isSubmitted ? (
          <div className="text-center">
            <p className="text-primary font-semibold text-sm">Thanks for joining! We will reach out to you shortly.</p>
          </div>
        ) : (
          <div className="text-center">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-secondary border border-gray-600 rounded-lg text-text-secondary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isSubmitting 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-cta-hover text-white transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Joining...
                  </div>
                ) : (
                  'Join'
                )}
              </button>
            </form>
            
            {error && (
              <p className="text-red-400 text-sm mt-3 animate-fade-in">
                {error}
              </p>
            )}
          </div>
        )}
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 