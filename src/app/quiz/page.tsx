'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { JapaneseText } from '@/components/ui/japanese-text'
import { AudioButton } from '@/components/ui/audio-button'
import { Heart, Trophy, X } from 'lucide-react'
import { api } from '@/lib/api'
import confetti from 'canvas-confetti'

interface Question {
  id: number
  type: 'multiple-choice' | 'type-answer' | 'match' | 'listen'
  question: string
  questionJP?: string
  options?: string[]
  correctAnswer: string
  explanation?: string
  audioUrl?: string
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const data = await api.getQuizQuestions()
        setQuestions(data)
      } catch (error: any) {
        console.error('Failed to fetch quiz questions:', error)
        setError(error.message || 'Failed to load quiz questions')
        setQuestions([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-text-secondary">Loading quiz...</div>
        </div>
      </PageWrapper>
    )
  }

  if (error || questions.length === 0) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-text-secondary mb-2">{error || 'No quiz questions available'}</p>
            <p className="text-text-tertiary text-sm">Quiz questions endpoint not yet implemented</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleAnswer = (answer: string) => {
    if (showResult) return

    const correct = answer === currentQuestion.correctAnswer
    setIsCorrect(correct)
    setSelectedAnswer(answer)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + 1)
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
      })
    } else {
      setHearts((prev) => Math.max(0, prev - 1))
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setSelectedAnswer(null)
        setTypedAnswer('')
        setShowResult(false)
      } else {
        setQuizComplete(true)
      }
    }, 2000)
  }

  const handleTypeAnswer = () => {
    if (!typedAnswer.trim()) return
    handleAnswer(typedAnswer.trim())
  }

  const resetQuiz = () => {
    setCurrentIndex(0)
    setHearts(3)
    setScore(0)
    setSelectedAnswer(null)
    setTypedAnswer('')
    setShowResult(false)
    setQuizComplete(false)
  }

  if (quizComplete || hearts === 0) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {hearts > 0 ? (
              <>
                <Trophy className="w-24 h-24 text-warning mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
              </>
            ) : (
              <>
                <X className="w-24 h-24 text-wrong mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-2">Quiz Over</h1>
              </>
            )}
          </motion.div>

          <div className="bg-bg-card border border-bg-elevated rounded-xl p-8 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-3xl font-bold text-sakura">{score}</p>
                <p className="text-sm text-text-secondary">Correct</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-wrong">
                  {questions.length - score}
                </p>
                <p className="text-sm text-text-secondary">Wrong</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo">
                  {Math.round((score / questions.length) * 100)}%
                </p>
                <p className="text-sm text-text-secondary">Accuracy</p>
              </div>
            </div>

            <div className="pt-4 border-t border-bg-elevated">
              <p className="text-lg font-semibold mb-2">XP Earned</p>
              <p className="text-3xl font-bold text-warning">
                +{score * 10} XP
              </p>
            </div>

            <button
              onClick={resetQuiz}
              className="w-full py-3 bg-sakura text-sumi rounded-lg font-semibold hover:bg-sakura-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quick Quiz</h1>
            <p className="text-text-secondary">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${
                  i < hearts ? 'text-wrong fill-wrong' : 'text-text-tertiary'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-bg-card rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sakura to-indigo"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-bg-card border border-bg-elevated rounded-xl p-8 space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold mb-2">{currentQuestion.question}</h2>
            {currentQuestion.questionJP && (
              <div className="flex items-center gap-3">
                <JapaneseText text={currentQuestion.questionJP} size="xl" />
                <AudioButton text={currentQuestion.questionJP} />
              </div>
            )}
          </div>

          {/* Multiple Choice */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                    showResult
                      ? option === currentQuestion.correctAnswer
                        ? 'bg-correct text-white'
                        : selectedAnswer === option
                        ? 'bg-wrong text-white'
                        : 'bg-bg-elevated text-text-secondary'
                      : 'bg-bg-elevated text-text-primary hover:bg-bg-card'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Type Answer */}
          {currentQuestion.type === 'type-answer' && (
            <div className="space-y-3">
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleTypeAnswer()
                }}
                placeholder="Type your answer in Japanese..."
                className="w-full px-4 py-3 bg-bg-elevated border border-bg-card rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-sakura"
                disabled={showResult}
              />
              <button
                onClick={handleTypeAnswer}
                disabled={!typedAnswer.trim() || showResult}
                className="w-full py-3 bg-sakura text-sumi rounded-lg font-semibold hover:bg-sakura-dark transition-colors disabled:opacity-50"
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Listen */}
          {currentQuestion.type === 'listen' && currentQuestion.questionJP && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <AudioButton text={currentQuestion.questionJP} className="text-4xl" />
              </div>
              {currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                        showResult
                          ? option === currentQuestion.correctAnswer
                            ? 'bg-correct text-white'
                            : selectedAnswer === option
                            ? 'bg-wrong text-white'
                            : 'bg-bg-elevated text-text-secondary'
                          : 'bg-bg-elevated text-text-primary hover:bg-bg-card'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Result Feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-lg ${
                  isCorrect ? 'bg-correct/20 border border-correct' : 'bg-wrong/20 border border-wrong'
                }`}
              >
                <p className={`font-semibold mb-2 ${
                  isCorrect ? 'text-correct' : 'text-wrong'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                {currentQuestion.explanation && (
                  <p className="text-sm text-text-secondary">{currentQuestion.explanation}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageWrapper>
  )
}

