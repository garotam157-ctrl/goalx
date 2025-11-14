import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Toaster } from '@/components/ui/sonner'
import Dashboard from '@/components/mindpulse/Dashboard'
import TypingTest from '@/components/mindpulse/TypingTest'
import MotionTracker from '@/components/mindpulse/MotionTracker'
import FocusAnalytics from '@/components/mindpulse/FocusAnalytics'
import { useFocusStore } from '@/lib/stores/focusStore'
import '@fontsource/inter'

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'typing' | 'motion' | 'analytics'>('dashboard')
  const { calculateFocusScore } = useFocusStore()

  // Calculate focus score every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      calculateFocusScore()
    }, 30000)

    return () => clearInterval(interval)
  }, [calculateFocusScore])

  return (
    <>
      <Helmet>
        <title>MindPulse - Termômetro de Foco</title>
        <meta name="description" content="Monitore sua frequência de foco e energia mental em tempo real" />
      </Helmet>

      <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Navigation */}
        <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  MindPulse
                </h1>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeView === 'dashboard'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('typing')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeView === 'typing'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Digitação
                </button>
                <button
                  onClick={() => setActiveView('motion')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeView === 'motion'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Movimento
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeView === 'analytics'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Análise
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'typing' && <TypingTest />}
          {activeView === 'motion' && <MotionTracker />}
          {activeView === 'analytics' && <FocusAnalytics />}
        </main>

        {/* Toast notifications */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      </div>
    </>
  )
}

export default App
