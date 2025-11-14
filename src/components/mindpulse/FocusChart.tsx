import { useMemo } from 'react'
import { useFocusStore } from '@/lib/stores/focusStore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

export default function FocusChart() {
  const { currentSession, sessions } = useFocusStore()

  const chartData = useMemo(() => {
    const session = currentSession || sessions[sessions.length - 1]
    
    if (!session || session.metrics.length === 0) {
      // Return sample data if no session
      return Array.from({ length: 10 }, (_, i) => ({
        time: `${i}m`,
        score: 50 + Math.random() * 30,
      }))
    }

    return session.metrics.map((metric, index) => {
      const minutes = Math.floor((metric.timestamp - session.startTime) / 60000)
      
      // Calculate score from metrics
      const typingScore = Math.min((metric.typingSpeed / 80) * 30, 30)
      const accuracyScore = (metric.typingAccuracy / 100) * 20
      const motionScore = (metric.motionStability / 100) * 25
      const unlockScore = Math.max(25 - (metric.unlockFrequency * 5), 0)
      const totalScore = typingScore + accuracyScore + motionScore + unlockScore

      return {
        time: `${minutes}m`,
        score: Math.round(totalScore),
      }
    })
  }, [currentSession, sessions])

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="time" 
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
          <Area
            type="monotone"
            dataKey="score"
            stroke="#a855f7"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
