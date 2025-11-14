import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FocusMetrics {
  typingSpeed: number // palavras por minuto
  typingAccuracy: number // porcentagem
  motionStability: number // 0-100
  unlockFrequency: number // desbloqueios por hora
  timestamp: number
}

export interface FocusSession {
  id: string
  startTime: number
  endTime?: number
  metrics: FocusMetrics[]
  averageFocusScore: number
}

interface FocusState {
  // Current metrics
  currentMetrics: FocusMetrics
  focusScore: number // 0-100
  focusLevel: 'low' | 'medium' | 'high' | 'peak'
  
  // Historical data
  sessions: FocusSession[]
  currentSession: FocusSession | null
  
  // Tracking data
  lastUnlockTime: number
  unlockCount: number
  
  // Actions
  updateTypingMetrics: (speed: number, accuracy: number) => void
  updateMotionMetrics: (stability: number) => void
  recordUnlock: () => void
  calculateFocusScore: () => void
  startSession: () => void
  endSession: () => void
  getSuggestions: () => string[]
  getBestFocusTime: () => { start: number; end: number } | null
}

const calculateFocusLevel = (score: number): 'low' | 'medium' | 'high' | 'peak' => {
  if (score >= 80) return 'peak'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      currentMetrics: {
        typingSpeed: 0,
        typingAccuracy: 0,
        motionStability: 100,
        unlockFrequency: 0,
        timestamp: Date.now(),
      },
      focusScore: 50,
      focusLevel: 'medium',
      sessions: [],
      currentSession: null,
      lastUnlockTime: Date.now(),
      unlockCount: 0,

      updateTypingMetrics: (speed, accuracy) => {
        set((state) => ({
          currentMetrics: {
            ...state.currentMetrics,
            typingSpeed: speed,
            typingAccuracy: accuracy,
            timestamp: Date.now(),
          },
        }))
        get().calculateFocusScore()
      },

      updateMotionMetrics: (stability) => {
        set((state) => ({
          currentMetrics: {
            ...state.currentMetrics,
            motionStability: stability,
            timestamp: Date.now(),
          },
        }))
        get().calculateFocusScore()
      },

      recordUnlock: () => {
        const now = Date.now()
        const hourAgo = now - 3600000
        
        set((state) => {
          const recentUnlocks = state.unlockCount + 1
          return {
            lastUnlockTime: now,
            unlockCount: recentUnlocks,
            currentMetrics: {
              ...state.currentMetrics,
              unlockFrequency: recentUnlocks,
              timestamp: now,
            },
          }
        })
        
        get().calculateFocusScore()
      },

      calculateFocusScore: () => {
        const { currentMetrics } = get()
        
        // Typing speed score (0-30 points)
        const typingScore = Math.min((currentMetrics.typingSpeed / 80) * 30, 30)
        
        // Typing accuracy score (0-20 points)
        const accuracyScore = (currentMetrics.typingAccuracy / 100) * 20
        
        // Motion stability score (0-25 points)
        const motionScore = (currentMetrics.motionStability / 100) * 25
        
        // Unlock frequency score (0-25 points, lower is better)
        const unlockScore = Math.max(25 - (currentMetrics.unlockFrequency * 5), 0)
        
        const totalScore = Math.round(typingScore + accuracyScore + motionScore + unlockScore)
        const focusLevel = calculateFocusLevel(totalScore)
        
        set({
          focusScore: totalScore,
          focusLevel,
        })

        // Add to current session if active
        const { currentSession } = get()
        if (currentSession) {
          set((state) => ({
            currentSession: {
              ...currentSession,
              metrics: [...currentSession.metrics, currentMetrics],
              averageFocusScore: totalScore,
            },
          }))
        }
      },

      startSession: () => {
        const session: FocusSession = {
          id: `session-${Date.now()}`,
          startTime: Date.now(),
          metrics: [],
          averageFocusScore: 50,
        }
        
        set({
          currentSession: session,
          unlockCount: 0,
        })
      },

      endSession: () => {
        const { currentSession, sessions } = get()
        
        if (currentSession) {
          const completedSession = {
            ...currentSession,
            endTime: Date.now(),
          }
          
          set({
            sessions: [...sessions, completedSession],
            currentSession: null,
          })
        }
      },

      getSuggestions: () => {
        const { focusScore, focusLevel, currentMetrics } = get()
        const suggestions: string[] = []

        if (focusLevel === 'peak') {
          suggestions.push('🎯 Momento ideal para tarefas complexas!')
          suggestions.push('💡 Aproveite para resolver problemas difíceis')
          suggestions.push('🚀 Seu foco está no máximo')
        } else if (focusLevel === 'high') {
          suggestions.push('✅ Bom momento para trabalho produtivo')
          suggestions.push('📝 Ideal para escrita e planejamento')
        } else if (focusLevel === 'medium') {
          suggestions.push('⚠️ Considere fazer uma pausa curta')
          suggestions.push('🧘 Tente exercícios de respiração')
          suggestions.push('☕ Uma pausa pode ajudar')
        } else {
          suggestions.push('🛑 Hora de descansar!')
          suggestions.push('🚶 Faça uma caminhada de 5 minutos')
          suggestions.push('💤 Considere uma pausa mais longa')
        }

        if (currentMetrics.unlockFrequency > 5) {
          suggestions.push('📱 Muitos desbloqueios - tente modo foco')
        }

        if (currentMetrics.typingAccuracy < 80) {
          suggestions.push('⌨️ Diminua a velocidade para melhorar precisão')
        }

        if (currentMetrics.motionStability < 50) {
          suggestions.push('🤚 Movimentos instáveis - tente relaxar')
        }

        return suggestions
      },

      getBestFocusTime: () => {
        const { sessions } = get()
        
        if (sessions.length === 0) return null

        // Find session with highest average focus score
        const bestSession = sessions.reduce((best, current) => 
          current.averageFocusScore > best.averageFocusScore ? current : best
        )

        return {
          start: bestSession.startTime,
          end: bestSession.endTime || Date.now(),
        }
      },
    }),
    {
      name: 'mindpulse-focus-storage',
    }
  )
)
