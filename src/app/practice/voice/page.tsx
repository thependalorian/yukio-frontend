'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { VoiceRecorder } from '@/components/ui/voice-recorder'
import { JapaneseText } from '@/components/ui/japanese-text'
import { AchievementNotification } from '@/components/ui/achievement-notification'
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'

interface PracticePhrase {
  id: number
  japanese: string
  romaji: string
  english: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export default function VoicePracticePage() {
  const [phrases, setPhrases] = useState<PracticePhrase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string>('')
  const [newAchievement, setNewAchievement] = useState<any>(null)

  useEffect(() => {
    async function fetchPhrases() {
      try {
        const data = await api.getVoicePhrases()
        setPhrases(data)
      } catch (error: any) {
        console.error('Failed to fetch voice phrases:', error)
        setError(error.message || 'Failed to load voice practice phrases')
        setPhrases([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchPhrases()
  }, [])

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-text-secondary">Loading voice practice...</div>
        </div>
      </PageWrapper>
    )
  }

  if (error || phrases.length === 0) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-text-secondary mb-2">{error || 'No voice practice phrases available'}</p>
            <p className="text-text-tertiary text-sm">Voice phrases endpoint not yet implemented</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const currentPhrase = phrases[currentIndex]

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setError(null)
      // Send audio to backend for pronunciation analysis
      const result = await api.analyzePronunciation(
        audioBlob,
        currentPhrase.japanese,
        currentPhrase.romaji
      )
      
      setScore(result.score)
      setFeedback(result.feedback)
      
      // Log for debugging
      console.log('Pronunciation analysis:', {
        transcript: result.transcript,
        score: result.score,
        target: currentPhrase.japanese
      })
      
      // Show achievement notifications if any were unlocked
      if (result.achievements_unlocked && result.achievements_unlocked.length > 0) {
        // Show first achievement notification
        setNewAchievement(result.achievements_unlocked[0])
      }
    } catch (error: any) {
      console.error('Pronunciation analysis error:', error)
      setError(error.message || 'Failed to analyze pronunciation')
      setScore(null)
      setFeedback('')
    }
  }

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setScore(null)
      setFeedback('')
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setScore(null)
      setFeedback('')
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold">Voice Practice</h1>
          <p className="text-text-secondary">
            Practice your pronunciation and get AI feedback
          </p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Phrase {currentIndex + 1} of {phrases.length}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-bg-card rounded">
              {currentPhrase.category}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              currentPhrase.difficulty === 'easy' ? 'bg-correct/20 text-correct' :
              currentPhrase.difficulty === 'medium' ? 'bg-warning/20 text-warning' :
              'bg-wrong/20 text-wrong'
            }`}>
              {currentPhrase.difficulty}
            </span>
          </div>
        </div>

        {/* Voice Recorder */}
        <div className="bg-bg-card border border-bg-elevated rounded-xl p-8">
          <VoiceRecorder
            targetPhrase={currentPhrase.japanese}
            targetRomaji={currentPhrase.romaji}
            targetEnglish={currentPhrase.english}
            onRecordingComplete={handleRecordingComplete}
          />
        </div>

        {/* Feedback Section */}
        {score !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card border border-bg-elevated rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Pronunciation Score</h3>
              <div className={`text-3xl font-bold ${
                score >= 90 ? 'text-correct' :
                score >= 80 ? 'text-warning' :
                'text-wrong'
              }`}>
                {score}%
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full h-4 bg-bg-elevated rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  score >= 90 ? 'bg-correct' :
                  score >= 80 ? 'bg-warning' :
                  'bg-wrong'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Feedback Text */}
            <p className="text-text-secondary">{feedback}</p>

            {/* Tips */}
            {score < 90 && (
              <div className="pt-4 border-t border-bg-elevated space-y-2">
                <p className="text-sm font-semibold text-text-primary">Tips for improvement:</p>
                <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                  <li>Listen to the native pronunciation multiple times</li>
                  <li>Pay attention to pitch accent patterns</li>
                  <li>Practice each syllable slowly, then speed up</li>
                  <li>Record yourself again and compare</li>
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-bg-card border border-bg-elevated rounded-lg font-semibold hover:bg-bg-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= phrases.length - 1}
            className="px-6 py-3 bg-sakura text-sumi rounded-lg font-semibold hover:bg-sakura-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Phrase
          </button>
        </div>

        {/* Practice Tips */}
        <div className="bg-bg-card border border-bg-elevated rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sakura" />
            Practice Tips
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• Record yourself multiple times to improve</li>
            <li>• Focus on one phrase at a time</li>
            <li>• Compare your recording with the native pronunciation</li>
            <li>• Practice daily for best results</li>
          </ul>
        </div>
      </div>

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />
    </PageWrapper>
  )
}

