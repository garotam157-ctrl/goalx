import { useState, useEffect, useRef } from 'react'
import { Move, Smartphone, Activity, TrendingUp, Zap, Target, AlertCircle } from 'lucide-react'
import { useFocusStore } from '@/lib/stores/focusStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface MotionPoint {
  x: number
  y: number
  z: number
  timestamp: number
  intensity: number
}

interface SessionStats {
  duration: number
  avgStability: number
  maxIntensity: number
  tremors: number
}

export default function MotionTracker() {
  const { updateMotionMetrics, recordUnlock } = useFocusStore()
  
  const [isTracking, setIsTracking] = useState(false)
  const [motionData, setMotionData] = useState({ x: 0, y: 0, z: 0 })
  const [stability, setStability] = useState(100)
  const [movementIntensity, setMovementIntensity] = useState(0)
  const [unlockSimulation, setUnlockSimulation] = useState(0)
  const [tremors, setTremors] = useState(0)
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    duration: 0,
    avgStability: 100,
    maxIntensity: 0,
    tremors: 0
  })
  
  const motionHistoryRef = useRef<MotionPoint[]>([])
  const lastMotionRef = useRef({ x: 0, y: 0, z: 0 })
  const sessionStartRef = useRef<number>(0)
  const stabilityHistoryRef = useRef<number[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw real-time motion graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isTracking) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawGraph = () => {
      const width = canvas.width
      const height = canvas.height
      
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, width, height)
      
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, height)
        ctx.stroke()
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(width, i)
        ctx.stroke()
      }

      // Draw motion history
      if (motionHistoryRef.current.length > 1) {
        const points = motionHistoryRef.current.slice(-100)
        const step = width / 100

        // Draw X axis (red)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'
        ctx.lineWidth = 2
        ctx.beginPath()
        points.forEach((point, i) => {
          const x = i * step
          const y = height / 2 - point.x * 5
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()

        // Draw Y axis (green)
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)'
        ctx.beginPath()
        points.forEach((point, i) => {
          const x = i * step
          const y = height / 2 - point.y * 5
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()

        // Draw Z axis (blue)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
        ctx.beginPath()
        points.forEach((point, i) => {
          const x = i * step
          const y = height / 2 - point.z * 5
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()

        // Draw intensity (purple gradient)
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)')
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.8)')
        ctx.strokeStyle = gradient
        ctx.lineWidth = 3
        ctx.beginPath()
        points.forEach((point, i) => {
          const x = i * step
          const y = height - point.intensity * 20
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
      }

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()
    }

    const animationFrame = requestAnimationFrame(function animate() {
      drawGraph()
      requestAnimationFrame(animate)
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [isTracking])

  useEffect(() => {
    let animationFrame: number

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!isTracking) return

      const acceleration = event.accelerationIncludingGravity
      if (!acceleration) return

      const x = acceleration.x || 0
      const y = acceleration.y || 0
      const z = acceleration.z || 0

      setMotionData({ x, y, z })

      // Calculate movement intensity
      const deltaX = Math.abs(x - lastMotionRef.current.x)
      const deltaY = Math.abs(y - lastMotionRef.current.y)
      const deltaZ = Math.abs(z - lastMotionRef.current.z)
      const intensity = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2)

      lastMotionRef.current = { x, y, z }

      // Detect tremors (sudden spikes in intensity)
      if (intensity > 5) {
        setTremors(prev => prev + 1)
      }

      // Add to history
      const motionPoint: MotionPoint = {
        x,
        y,
        z,
        timestamp: Date.now(),
        intensity
      }
      motionHistoryRef.current.push(motionPoint)
      if (motionHistoryRef.current.length > 200) {
        motionHistoryRef.current.shift()
      }

      // Calculate stability (inverse of variance)
      const recentMotion = motionHistoryRef.current.slice(-50)
      const intensities = recentMotion.map(p => p.intensity)
      const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length
      const variance = intensities.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intensities.length
      const stabilityScore = Math.max(0, Math.min(100, 100 - variance * 10))

      setStability(stabilityScore)
      setMovementIntensity(intensity)
      stabilityHistoryRef.current.push(stabilityScore)
      if (stabilityHistoryRef.current.length > 100) {
        stabilityHistoryRef.current.shift()
      }

      updateMotionMetrics(stabilityScore)

      // Update session stats
      if (sessionStartRef.current > 0) {
        const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000)
        const avgStability = stabilityHistoryRef.current.reduce((a, b) => a + b, 0) / stabilityHistoryRef.current.length
        const maxIntensity = Math.max(...intensities)
        
        setSessionStats({
          duration,
          avgStability,
          maxIntensity,
          tremors
        })
      }
    }

    if (isTracking) {
      window.addEventListener('devicemotion', handleMotion)
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [isTracking, updateMotionMetrics, tremors])

  const handleStartTracking = async () => {
    // Check if DeviceMotionEvent is available
    if (typeof DeviceMotionEvent === 'undefined') {
      toast.error('Sensor de movimento não disponível', {
        description: 'Seu dispositivo não suporta detecção de movimento',
      })
      return
    }

    // Request permission on iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission()
        if (permission !== 'granted') {
          toast.error('Permissão negada', {
            description: 'É necessário permitir acesso aos sensores de movimento',
          })
          return
        }
      } catch (error) {
        toast.error('Erro ao solicitar permissão', {
          description: 'Não foi possível acessar os sensores',
        })
        return
      }
    }

    setIsTracking(true)
    sessionStartRef.current = Date.now()
    stabilityHistoryRef.current = []
    motionHistoryRef.current = []
    setTremors(0)
    toast.success('Rastreamento iniciado', {
      description: 'Movimente seu dispositivo suavemente para análise',
    })
  }

  const handleStopTracking = () => {
    setIsTracking(false)
    const duration = sessionStats.duration
    const avgStability = sessionStats.avgStability
    
    toast.info('Sessão finalizada', {
      description: `Duração: ${duration}s | Estabilidade média: ${avgStability.toFixed(0)}%`,
    })
  }

  const handleSimulateUnlock = () => {
    recordUnlock()
    setUnlockSimulation(prev => prev + 1)
    toast.info('Desbloqueio registrado', {
      description: `Total: ${unlockSimulation + 1} desbloqueios`,
    })
  }

  const getStabilityColor = () => {
    if (stability >= 80) return 'text-green-400'
    if (stability >= 60) return 'text-blue-400'
    if (stability >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStabilityLabel = () => {
    if (stability >= 80) return 'Excelente'
    if (stability >= 60) return 'Boa'
    if (stability >= 40) return 'Moderada'
    return 'Instável'
  }

  const getStabilityBgColor = () => {
    if (stability >= 80) return 'from-green-500/20 to-emerald-500/20'
    if (stability >= 60) return 'from-blue-500/20 to-cyan-500/20'
    if (stability >= 40) return 'from-yellow-500/20 to-orange-500/20'
    return 'from-red-500/20 to-pink-500/20'
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center mb-2">
              <Move className="w-8 h-8 mr-3 text-purple-400" />
              Rastreamento de Movimento
            </h2>
            <p className="text-gray-400">
              Análise em tempo real da estabilidade e padrões de movimento
            </p>
          </div>
          <div className="flex gap-3">
            {!isTracking ? (
              <Button
                onClick={handleStartTracking}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
              >
                <Activity className="w-5 h-5 mr-2" />
                Iniciar Sessão
              </Button>
            ) : (
              <Button
                onClick={handleStopTracking}
                size="lg"
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500/10"
              >
                Finalizar Sessão
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stability Score */}
        <Card className={`glass p-6 bg-gradient-to-br ${getStabilityBgColor()}`}>
          <div className="flex items-center justify-between mb-4">
            <Target className="w-6 h-6 text-gray-400" />
            {isTracking && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-400">Ativo</span>
              </div>
            )}
          </div>
          <div className={`text-6xl font-bold mb-2 ${getStabilityColor()}`}>
            {stability.toFixed(0)}%
          </div>
          <div className="text-lg text-gray-300">
            Estabilidade: <span className={getStabilityColor()}>{getStabilityLabel()}</span>
          </div>
          <div className="mt-4 h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getStabilityColor().replace('text-', 'from-')} to-purple-500 transition-all duration-500`}
              style={{ width: `${stability}%` }}
            />
          </div>
        </Card>

        {/* Session Duration */}
        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-gray-400">Tempo de Sessão</span>
          </div>
          <div className="text-5xl font-bold text-white mb-2">
            {formatDuration(sessionStats.duration)}
          </div>
          <div className="text-sm text-gray-400">
            Estabilidade média: <span className="text-blue-400 font-semibold">{sessionStats.avgStability.toFixed(0)}%</span>
          </div>
        </Card>

        {/* Tremors Detection */}
        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span className="text-xs text-gray-400">Detecção de Tremores</span>
          </div>
          <div className="text-5xl font-bold text-white mb-2">
            {tremors}
          </div>
          <div className="text-sm text-gray-400">
            Movimentos bruscos detectados
          </div>
          {tremors > 10 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span>Alto nível de instabilidade</span>
            </div>
          )}
        </Card>
      </div>

      {/* Real-time Graph */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
            Gráfico em Tempo Real
          </h3>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-400">Eixo X</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-400">Eixo Y</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-400">Eixo Z</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-gray-400">Intensidade</span>
            </div>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-[300px] rounded-lg bg-black/30 border border-white/10"
        />
      </Card>

      {/* Motion Data & Visual Indicator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Motion Data */}
        <Card className="glass p-6">
          <h3 className="text-xl font-bold text-white mb-4">Dados de Aceleração</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Eixo X</span>
                <span className="text-xs text-red-400">Horizontal</span>
              </div>
              <div className="text-3xl font-bold text-white">{motionData.x.toFixed(2)}</div>
              <div className="mt-2 h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-100"
                  style={{ width: `${Math.min(Math.abs(motionData.x) * 10, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Eixo Y</span>
                <span className="text-xs text-green-400">Vertical</span>
              </div>
              <div className="text-3xl font-bold text-white">{motionData.y.toFixed(2)}</div>
              <div className="mt-2 h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${Math.min(Math.abs(motionData.y) * 10, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Eixo Z</span>
                <span className="text-xs text-blue-400">Profundidade</span>
              </div>
              <div className="text-3xl font-bold text-white">{motionData.z.toFixed(2)}</div>
              <div className="mt-2 h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-100"
                  style={{ width: `${Math.min(Math.abs(motionData.z) * 10, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Intensidade Total</span>
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">{movementIntensity.toFixed(2)}</div>
              <div className="mt-2 h-3 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                  style={{ width: `${Math.min(movementIntensity * 10, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Visual Indicator */}
        <Card className="glass p-6">
          <h3 className="text-xl font-bold text-white mb-4">Visualização 3D</h3>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-white/10 flex items-center justify-center mb-6">
              {/* Grid lines */}
              <div className="absolute w-full h-0.5 bg-white/10" />
              <div className="absolute w-0.5 h-full bg-white/10" />
              
              {/* Moving indicator */}
              <div
                className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 transition-transform duration-100 flex items-center justify-center"
                style={{
                  transform: `translate(${motionData.x * 3}px, ${motionData.y * 3}px) scale(${1 + movementIntensity * 0.1})`,
                }}
              >
                <div className="w-6 h-6 rounded-full bg-white/30 animate-pulse" />
              </div>
              
              {/* Device icon */}
              <Smartphone className="w-20 h-20 text-gray-600/50" />
            </div>

            <div className="text-center space-y-2">
              <div className="text-sm text-gray-400">
                Movimente seu dispositivo para ver a resposta em tempo real
              </div>
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-gray-400">Posição atual</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                  <span className="text-gray-400">Centro</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Instructions & Unlock Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-blue-400" />
            Como Usar
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-400">1</span>
              </div>
              <p>Clique em "Iniciar Sessão" para começar o rastreamento de movimento</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-400">2</span>
              </div>
              <p>Segure seu dispositivo e movimente-o suavemente em diferentes direções</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-400">3</span>
              </div>
              <p>Observe o gráfico em tempo real e as métricas de estabilidade</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-400">4</span>
              </div>
              <p>Maior estabilidade indica melhor foco e concentração</p>
            </div>
          </div>
        </Card>

        <Card className="glass p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-purple-400" />
            Simulação de Desbloqueio
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Registre desbloqueios de tela para analisar padrões de uso e frequência de distração
            </p>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">{unlockSimulation}</div>
                  <div className="text-sm text-gray-400">Desbloqueios registrados</div>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
              </div>
              <Button
                onClick={handleSimulateUnlock}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Registrar Desbloqueio
              </Button>
            </div>
            <div className="text-xs text-gray-400">
              💡 Dica: Menos desbloqueios indicam maior foco e concentração
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
