import { useState, useEffect, useRef } from 'react'
import { Keyboard, Timer, Target } from 'lucide-react'
import { useFocusStore } from '@/lib/stores/focusStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const SAMPLE_TEXTS = [
  "A prática leva à perfeição. Quanto mais você treina, melhor você fica.",
  "O foco é a chave para a produtividade. Mantenha sua mente concentrada.",
  "Cada palavra digitada é um passo em direção ao domínio da digitação.",
  "A velocidade vem com o tempo. Primeiro, foque na precisão.",
  "Seus dedos são instrumentos poderosos. Treine-os bem.",
]

export default function TypingTest() {
  const { updateTypingMetrics } = useFocusStore()
  
  const [text, setText] = useState('')
  const [input, setInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [errors, setErrors] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Select random text on mount
    setText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)])
  }, [])

  useEffect(() => {
    if (isActive && input.length > 0) {
      calculateMetrics()
    }
  }, [input, isActive])

  const calculateMetrics = () => {
    if (!startTime) return

    const timeElapsed = (Date.now() - startTime) / 1000 / 60 // minutes
    const wordsTyped = input.trim().split(/\s+/).length
    const currentWpm = Math.round(wordsTyped / timeElapsed) || 0

    // Calculate accuracy
    let correctChars = 0
    let totalChars = Math.min(input.length, text.length)
    
    for (let i = 0; i < totalChars; i++) {
      if (input[i] === text[i]) {
        correctChars++
      }
    }

    const currentAccuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100
    const currentErrors = totalChars - correctChars

    setWpm(currentWpm)
    setAccuracy(currentAccuracy)
    setErrors(currentErrors)

    // Update store
    updateTypingMetrics(currentWpm, currentAccuracy)
  }

  const handleStart = () => {
    setIsActive(true)
    setStartTime(Date.now())
    setInput('')
    setWpm(0)
    setAccuracy(100)
    setErrors(0)
    inputRef.current?.focus()
  }

  const handleReset = () => {
    setIsActive(false)
    setStartTime(null)
    setInput('')
    setWpm(0)
    setAccuracy(100)
    setErrors(0)
    setText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    
    if (!isActive) {
      handleStart()
    }

    setInput(value)

    // Check if completed
    if (value.length >= text.length) {
      setIsActive(false)
      toast.success('Teste concluído!', {
        description: `${wpm} WPM com ${accuracy}% de precisão`,
      })
    }
  }

  const getCharColor = (index: number) => {
    if (index >= input.length) return 'text-gray-500'
    if (input[index] === text[index]) return 'text-green-400'
    return 'text-red-400'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="glass p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Keyboard className="w-6 h-6 mr-2 text-purple-400" />
            Teste de Digitação
          </h2>
          <div className="flex gap-4">
            <Button
              onClick={handleStart}
              disabled={isActive}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Timer className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Resetar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Velocidade</div>
            <div className="text-3xl font-bold text-white">{wpm} WPM</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Precisão</div>
            <div className="text-3xl font-bold text-white">{accuracy}%</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Erros</div>
            <div className="text-3xl font-bold text-white">{errors}</div>
          </div>
        </div>

        {/* Text Display */}
        <div className="mb-6 p-6 rounded-lg bg-black/30 border border-white/10">
          <div className="text-xl leading-relaxed font-mono">
            {text.split('').map((char, index) => (
              <span key={index} className={getCharColor(index)}>
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Comece a digitar aqui..."
          className="w-full h-32 p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-lg resize-none"
          disabled={!isActive && input.length === 0}
        />

        {/* Tips */}
        <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-start">
            <Target className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <strong className="text-white">Dica:</strong> Foque na precisão primeiro. A velocidade virá naturalmente com a prática.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
