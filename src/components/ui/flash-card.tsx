'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { JapaneseText } from './japanese-text'
import { AudioButton } from './audio-button'
import { CheckCircle2, XCircle, Volume2 } from 'lucide-react'

interface FlashCardProps {
  word: {
    id: number
    japanese: string
    reading: string
    romaji: string
    english: string
    example?: string
    exampleReading?: string
    exampleTranslation?: string
  }
  mode: 'recognition' | 'production' | 'listening'
  onAnswer: (correct: boolean) => void
  showAnswer?: boolean
}

export function FlashCard({ word, mode, onAnswer, showAnswer = false }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  const handleFlip = () => {
    if (!showAnswer) {
      setIsFlipped(true)
    }
  }

  const handleAnswer = (answer: string) => {
    if (showAnswer) return
    setSelectedAnswer(answer)
    const isCorrect = answer === word.english
    setTimeout(() => {
      onAnswer(isCorrect)
      setIsFlipped(false)
      setSelectedAnswer(null)
    }, 1500)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="relative h-96 perspective-1000"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Card */}
        <motion.div
          className="absolute inset-0 backface-hidden bg-bg-card border-2 border-bg-elevated rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer"
          onClick={handleFlip}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {mode === 'recognition' && (
            <div className="text-center space-y-6">
              <JapaneseText text={word.japanese} className="text-5xl font-bold mb-2" />
              <p className="text-2xl text-sakura">{word.reading}</p>
              <p className="text-lg text-text-secondary italic">{word.romaji}</p>
              {!showAnswer && (
                <p className="text-sm text-text-tertiary mt-4">Tap to reveal answer</p>
              )}
            </div>
          )}

          {mode === 'production' && (
            <div className="text-center space-y-6">
              <p className="text-3xl font-bold text-text-primary mb-4">{word.english}</p>
              {!showAnswer && (
                <p className="text-sm text-text-tertiary">What is this in Japanese?</p>
              )}
            </div>
          )}

          {mode === 'listening' && (
            <div className="text-center space-y-6">
              <div className="w-32 h-32 mx-auto bg-sakura/20 rounded-full flex items-center justify-center">
                <Volume2 className="w-16 h-16 text-sakura" />
              </div>
              <AudioButton text={word.japanese} className="text-2xl" />
              {!showAnswer && (
                <p className="text-sm text-text-tertiary mt-4">Listen and select the meaning</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Back Card (Answer) */}
        <motion.div
          className="absolute inset-0 backface-hidden bg-bg-card border-2 border-bg-elevated rounded-2xl p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-center space-y-6">
            <JapaneseText text={word.japanese} className="text-4xl font-bold" />
            <p className="text-xl text-sakura">{word.reading}</p>
            <p className="text-lg text-text-secondary italic">{word.romaji}</p>
            <div className="pt-4 border-t border-bg-elevated">
              <p className="text-2xl font-bold text-text-primary">{word.english}</p>
            </div>
            {word.example && (
              <div className="pt-4 border-t border-bg-elevated space-y-2">
                <p className="text-sm text-text-tertiary">Example:</p>
                <JapaneseText text={word.example} className="text-lg" />
                {word.exampleReading && (
                  <p className="text-sm text-sakura">{word.exampleReading}</p>
                )}
                {word.exampleTranslation && (
                  <p className="text-sm text-text-secondary italic">{word.exampleTranslation}</p>
                )}
              </div>
            )}
            <AudioButton text={word.japanese} />
          </div>
        </motion.div>
      </motion.div>

      {/* Answer Options (for listening mode) */}
      {mode === 'listening' && !isFlipped && (
        <div className="mt-6 space-y-2">
          {['to eat', 'to drink', 'to go', word.english].sort(() => Math.random() - 0.5).map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={showAnswer}
              className={`w-full p-4 rounded-lg font-medium transition-all ${
                selectedAnswer === option
                  ? option === word.english
                    ? 'bg-correct text-white'
                    : 'bg-wrong text-white'
                  : 'bg-bg-card text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {selectedAnswer === option && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {option === word.english ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </motion.div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Swipe Hints */}
      {!isFlipped && mode !== 'listening' && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-tertiary">
          <span>← Wrong</span>
          <span>Tap to flip</span>
          <span>Correct →</span>
        </div>
      )}
    </div>
  )
}

