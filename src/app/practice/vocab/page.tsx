'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { FlashCard } from '@/components/ui/flash-card'
import { ProgressRing } from '@/components/ui'
import { RotateCcw, Volume2, Type, Headphones } from 'lucide-react'
import { api } from '@/lib/api'
import confetti from 'canvas-confetti'

interface VocabWord {
  id: number
  japanese: string
  reading: string
  romaji: string
  english: string
  example?: string
  exampleReading?: string
  exampleTranslation?: string
  jlpt: string
}

type PracticeMode = 'recognition' | 'production' | 'listening'

export default function VocabPracticePage() {
  const [vocab, setVocab] = useState<VocabWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<PracticeMode>('recognition')
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)

  useEffect(() => {
    async function fetchVocab() {
      try {
        const data = await api.getVocabulary()
        setVocab(data)
      } catch (error: any) {
        console.error('Failed to fetch vocabulary:', error)
        setError(error.message || 'Failed to load vocabulary')
        setVocab([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchVocab()
  }, [])

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-text-secondary">Loading vocabulary...</div>
        </div>
      </PageWrapper>
    )
  }

  if (error || vocab.length === 0) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-text-secondary mb-2">{error || 'No vocabulary available'}</p>
            <p className="text-text-tertiary text-sm">Vocabulary endpoint not yet implemented</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const currentWord = vocab[currentIndex]
  const totalWords = vocab.length
  const progress = ((currentIndex + 1) / totalWords) * 100

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectCount((prev) => prev + 1)
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#FFB7C5'],
      })
    } else {
      setWrongCount((prev) => prev + 1)
    }

    setTimeout(() => {
      if (currentIndex < vocab.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setShowAnswer(false)
      } else {
        // Session complete
        setSessionStarted(false)
      }
    }, 1500)
  }

  const resetSession = () => {
    setCurrentIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setShowAnswer(false)
    setSessionStarted(true)
  }

  const modes: { id: PracticeMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'recognition',
      label: 'Recognition',
      icon: <Type className="w-5 h-5" />,
      description: 'See Japanese, recall English',
    },
    {
      id: 'production',
      label: 'Production',
      icon: <RotateCcw className="w-5 h-5" />,
      description: 'See English, recall Japanese',
    },
    {
      id: 'listening',
      label: 'Listening',
      icon: <Headphones className="w-5 h-5" />,
      description: 'Hear Japanese, select meaning',
    },
  ]

  if (!sessionStarted) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-bold">Vocabulary Practice</h1>
            <p className="text-text-secondary text-lg">
              Choose a practice mode to begin reviewing vocabulary
            </p>
          </motion.div>

          {/* Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modes.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => {
                  setMode(m.id)
                  setSessionStarted(true)
                }}
                className="p-6 bg-bg-card border-2 border-bg-elevated rounded-xl hover:border-sakura transition-all text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-sakura/20 rounded-lg flex items-center justify-center text-sakura">
                    {m.icon}
                  </div>
                  <h3 className="text-xl font-bold">{m.label}</h3>
                </div>
                <p className="text-sm text-text-secondary">{m.description}</p>
              </motion.button>
            ))}
          </div>

          {/* Stats Preview */}
          <div className="bg-bg-card border border-bg-elevated rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-sakura">{vocab.length}</p>
                <p className="text-sm text-text-secondary">Words Available</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-correct">{correctCount}</p>
                <p className="text-sm text-text-secondary">Mastered</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-warning">{wrongCount}</p>
                <p className="text-sm text-text-secondary">To Review</p>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Progress */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vocabulary Practice</h1>
            <p className="text-text-secondary">
              {modes.find((m) => m.id === mode)?.label} Mode
            </p>
          </div>
          <button
            onClick={resetSession}
            className="px-4 py-2 bg-bg-card border border-bg-elevated rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Word {currentIndex + 1} of {totalWords}
            </span>
            <span className="text-text-secondary">
              {correctCount} correct, {wrongCount} wrong
            </span>
          </div>
          <div className="w-full h-2 bg-bg-card rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sakura to-indigo"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Flash Card */}
        <div className="flex justify-center min-h-[500px] items-center">
          {currentWord && (
            <FlashCard
              word={currentWord}
              mode={mode}
              onAnswer={handleAnswer}
              showAnswer={showAnswer}
            />
          )}
        </div>

        {/* Session Complete */}
        {currentIndex >= vocab.length - 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 p-8 bg-bg-card border border-bg-elevated rounded-xl"
          >
            <h2 className="text-3xl font-bold">Session Complete!</h2>
            <div className="flex items-center justify-center gap-8">
              <div>
                <p className="text-4xl font-bold text-correct">{correctCount}</p>
                <p className="text-sm text-text-secondary">Correct</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-wrong">{wrongCount}</p>
                <p className="text-sm text-text-secondary">Wrong</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-sakura">
                  {Math.round((correctCount / totalWords) * 100)}%
                </p>
                <p className="text-sm text-text-secondary">Accuracy</p>
              </div>
            </div>
            <button
              onClick={resetSession}
              className="mt-6 px-6 py-3 bg-sakura text-sumi rounded-lg font-semibold hover:bg-sakura-dark transition-colors"
            >
              Practice Again
            </button>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}

