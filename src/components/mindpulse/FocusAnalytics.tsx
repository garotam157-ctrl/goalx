import { useMemo } from 'react'
import { BarChart, TrendingUp, Clock, Target, Calendar } from 'lucide-react'
import { useFocusStore } from '@/lib/stores/focusStore'
import { Card } from '@/components/ui/card'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function FocusAnalytics() {
  const { sessions, getBestFocusTime } = useFocusStore()

  const stats = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        totalTime: 0,
        bestScore: 0,
        peakSessions: 0,
        highSessions: 0,
        mediumSessions: 0,
        lowSessions: 0,
      }
    }

    const totalScore = sessions.reduce((sum, s) => sum + s.averageFocusScore, 0)
    const totalTime = sessions.reduce((sum, s) => {
      const duration = (s.endTime || Date.now()) - s.startTime
      return sum + duration
    }, 0)

    const bestScore = Math.max(...sessions.map(s => s.averageFocusScore))

    let peakSessions = 0
    let highSessions = 0
    let mediumSessions = 0
    let lowSessions = 0

    sessions.forEach(s => {
      if (s.averageFocusScore >= 80) peakSessions++
      else if (s.averageFocusScore >= 60) highSessions++
      else if (s.averageFocusScore >= 40) mediumSessions++
      else lowSessions++
    })

    return {
      totalSessions: sessions.length,
      averageScore: Math.round(totalScore / sessions.length),
      totalTime: Math.round(totalTime / 1000 / 60), // minutes
      bestScore: Math.round(bestScore),
      peakSessions,
      highSessions,
      mediumSessions,
      lowSessions,
    }
  }, [sessions])

  const sessionDistribution = useMemo(() => {
    return [
      { name: 'Foco Máximo', value: stats.peakSessions, color: '#10b981' },
      { name: 'Foco Alto', value: stats.highSessions, color: '#3b82f6' },
      { name: 'Foco Médio', value: stats.mediumSessions, color: '#f59e0b' },
      { name: 'Foco Baixo', value: stats.lowSessions, color: '#ef4444' },
    ].filter(item => item.value > 0)
  }, [stats])

  const recentSessions = useMemo(() => {
    return sessions.slice(-7).map((session, index) => ({
      name: `S${index + 1}`,
      score: session.averageFocusScore,
    }))
  }, [sessions])

  const bestFocusTime = getBestFocusTime()

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total de Sessões</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalSessions}</div>
        </Card>

        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Score Médio</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.averageScore}</div>
        </Card>

        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Tempo Total</span>
            <Clock className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{formatTime(stats.totalTime)}</div>
        </Card>

        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Melhor Score</span>
            <Target className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.bestScore}</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions Bar Chart */}
        <Card className="glass p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <BarChart className="w-5 h-5 mr-2 text-purple-400" />
            Sessões Recentes
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={recentSessions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
                <Bar dataKey="score" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Session Distribution Pie Chart */}
        <Card className="glass p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-400" />
            Distribuição de Foco
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sessionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sessionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Best Focus Time */}
      {bestFocusTime && (
        <Card className="glass p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-400" />
            Melhor Horário de Foco
          </h3>
          <div className="p-6 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {formatDate(bestFocusTime.start)} - {formatDate(bestFocusTime.end)}
              </div>
              <div className="text-gray-300">
                Este foi seu período de maior produtividade. Tente agendar tarefas importantes neste horário.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Insights */}
      <Card className="glass p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
          Insights e Recomendações
        </h3>
        <div className="space-y-3">
          {stats.totalSessions === 0 && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-gray-300">
              📊 Comece uma sessão para ver suas análises e insights personalizados
            </div>
          )}
          
          {stats.averageScore >= 70 && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-gray-300">
              🎯 Excelente! Seu score médio está acima de 70. Continue assim!
            </div>
          )}
          
          {stats.averageScore < 50 && stats.totalSessions > 3 && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-gray-300">
              ⚠️ Seu score médio está abaixo de 50. Tente fazer pausas regulares e reduzir distrações.
            </div>
          )}
          
          {stats.peakSessions > stats.totalSessions * 0.3 && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-gray-300">
              🚀 Mais de 30% das suas sessões atingiram foco máximo! Você está no caminho certo.
            </div>
          )}
          
          {stats.totalTime > 120 && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-gray-300">
              ⏰ Você já acumulou mais de 2 horas de sessões. Lembre-se de fazer pausas regulares.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
