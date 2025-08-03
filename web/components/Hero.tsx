'use client'

import { useState } from 'react'

export default function Hero() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    setEmail('')
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden w-full">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cta-hover/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        <div className="animate-fade-in">
          {/* App Icon */}
          <div className="mb-8">
            <div className="relative mx-auto w-40 h-40 bg-black rounded-3xl p-1 shadow-2xl border border-gray-700">
              <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center p-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 520 520" 
                  fill="white"
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M 252 380 l -100 -50 l5 -80 l75 -30 l25 25 l-25 35 l -35 -5 l 5 10 v 15 l -5 10 l 40 -2 l 40 30 Z" />
                  <path d="M 162 242 v -70 h45 v 53 Z" />
                  <path d="M 212 222 v -70 h45 v88 l -22 -25 Z" />
                  <path d="M 256 253 v 27 h -20 z" />
                  <path d="M 262 290 v-125 h45 v 110 z" />
                  <path d="M 312 275 v-110 h45 v 110 z" />
                  <path d="M 282 335 l -40 -30 l 65-25 h 55 l 2 60 l -40 40 z" />
                  <path d="M 212 420 v -55 l 42 21 l27 -46 l 43 45 l 30 -30 v 65 z" />
                  <path d="M 157 220 h -70 v 90 h 62 l 4 -60 z" />
                  <path d="M 362 220 h 70 v 90 h-65 l-2 -30 z" />
                  <path d="M 81 220 v -80 h -70 v 250 h 70 z" />
                  <path d="M 438 220 v-80 h70 v250 h -70z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-center mt-4">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              <h3 className="text-xl font-semibold text-text-primary">Callus</h3>
            </div>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Forge your fitness
            <span className="block gradient-text">mark by mark</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
          Track anywhere. Own your data. No paywalls, no gimmicks — just a clean, addictively smooth experience that gets you hooked on showing up.
          </p>

          {/* Workout Counters */}
          <div className="flex justify-center items-center gap-12 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">677</div>
              <div className="text-text-secondary">Workouts Tracked</div>
            </div>
            <div className="w-px h-12 bg-gray-600"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">903</div>
              <div className="text-text-secondary">Hours Logged</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 