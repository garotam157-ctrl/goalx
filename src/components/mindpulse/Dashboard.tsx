import { useEffect, useState } from 'react'
import { Activity, Brain, Zap, TrendingUp } from 'lucide-react'
import { useFocusStore } from '@/lib/stores/focusStore'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import FocusChart from './FocusChart'

export default function Dashboard() {
  const {
    focusScore,
    focusLevel,
    currentMetrics,
    currentSession,
    startSession,
    endSession,
    getSuggestions,
  } = useFocusStore()

  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    setSuggestions(getSuggestions())
  }, [focusScore, getSuggestions])

  const getFocusColor = () => {
    switch (focusLevel) {
      case 'peak': return 'from-green-500 to-emerald-500'
      case 'high': return 'from-blue-500 to-cyan-500'
      case 'medium': return 'from-yellow-500 to-orange-500'
      case 'low': return 'from-red-500 to-pink-500'
    }
  }

  const getFocusLabel = () => {
    switch (focusLevel) {
      case 'peak': return 'Foco Máximo'
      case 'high': return 'Foco Alto'
      case 'medium': return 'Foco Médio'
      case 'low': return 'Foco Baixo'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Focus Score */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-4 border-purple-500/30 animate-pulse-glow">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{focusScore}</div>
            <div className="text-sm text-gray-300">Score</div>
          </div>
        </div>
        
        <div>
          <h2 className={`text-3xl font-bold bg-gradient-to-r ${getFocusColor()} bg-clip-text text-transparent`}>
            {getFocusLabel()}
          </h2>
          <p className="text-gray-400 mt-2">
            {currentSession ? 'Sessão ativa' : 'Nenhuma sessão ativa'}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          {!currentSession ? (
            <Button
              onClick={startSession}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Activity className="w-4 h-4 mr-2" />
              Iniciar Sessão
            </Button>
          ) : (
            <Button
              onClick={endSession}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              Finalizar Sessão
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Velocidade</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {currentMetrics.typingSpeed.toFixed(0)} WPM
          </div>
          <Progress value={(currentMetrics.typingSpeed / 80) * 100} className="h-2" />
        </Card>

        <Card className="glass p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Precisão</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {currentMetrics.typingAccuracy.toFixed(0)}%
          </div>
          <Progress value={currentMetrics.typingAccuracy} className="h-2" />
        </Card>

        <Card className="glass p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Estabilidade</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {currentMetrics.motionStability.toFixed(0)}%
          </div>
          <Progress value={currentMetrics.motionStability} className="h-2" />
        </Card>

        <Card className="glass p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Desbloqueios</span>
            <Brain className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {currentMetrics.unlockFrequency}/h
          </div>
          <Progress value={Math.min((currentMetrics.unlockFrequency / 10) * 100, 100)} className="h-2" />
        </Card>
      </div>

      {/* Focus Chart */}
      <Card className="glass p-6">
        <h3 className="text-xl font-bold text-white mb-4">Energia Mental</h3>
        <FocusChart />
      </Card>

      {/* Suggestions */}
      <Card className="glass p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-400" />
          Sugestões Inteligentes
        </h3>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
            >
              {suggestion}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
