'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { JapaneseText } from '@/components/ui/japanese-text'
import { Crown, Lock, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'

interface Lesson {
  id: number
  title: string
  titleJP?: string
  description: string
  xp: number
  crowns: number
  status: 'locked' | 'available' | 'in-progress' | 'completed'
  jlpt: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  category: 'hiragana' | 'katakana' | 'kanji' | 'grammar' | 'vocabulary'
}

const categories = [
  { id: 'all', label: 'All Lessons', icon: 'All' },
  { id: 'hiragana', label: 'Hiragana', icon: 'あ' },
  { id: 'katakana', label: 'Katakana', icon: 'カ' },
  { id: 'kanji', label: 'Kanji', icon: '漢' },
  { id: 'grammar', label: 'Grammar', icon: '文' },
  { id: 'vocabulary', label: 'Vocabulary', icon: '語' },
]

const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedJLPT, setSelectedJLPT] = useState<string>('all')

  useEffect(() => {
    async function fetchLessons() {
      try {
        const data = await api.getLessons()
        setLessons(data)
      } catch (error: any) {
        console.error('Failed to fetch lessons:', error)
        setError(error.message || 'Failed to load lessons')
        setLessons([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchLessons()
  }, [])

  const filteredLessons = lessons.filter(lesson => {
    const categoryMatch = selectedCategory === 'all' || lesson.category === selectedCategory
    const jlptMatch = selectedJLPT === 'all' || lesson.jlpt === selectedJLPT
    return categoryMatch && jlptMatch
  })

  const getStatusIcon = (status: Lesson['status'], crowns: number) => {
    if (status === 'locked') return <Lock className="w-5 h-5 text-text-tertiary" />
    if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-correct" />
    return <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Crown
          key={i}
          className={`w-4 h-4 ${i < crowns ? 'text-warning fill-warning' : 'text-text-tertiary'}`}
        />
      ))}
    </div>
  }

  const getStatusColor = (status: Lesson['status']) => {
    switch (status) {
      case 'completed': return 'border-correct bg-correct/10'
      case 'in-progress': return 'border-sakura bg-sakura/10'
      case 'available': return 'border-indigo bg-indigo/10'
      case 'locked': return 'border-bg-elevated bg-bg-card opacity-60'
    }
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-text-secondary">Loading lessons...</div>
        </div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-text-secondary mb-2">{error}</p>
            <p className="text-text-tertiary text-sm">Lessons endpoint not yet implemented</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold">Lessons</h1>
          <p className="text-text-secondary">
            Master Japanese step by step with structured lessons
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-sakura text-sumi'
                    : 'bg-bg-card text-text-secondary hover:bg-bg-elevated'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* JLPT Filter */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setSelectedJLPT('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedJLPT === 'all'
                  ? 'bg-indigo text-white'
                  : 'bg-bg-card text-text-secondary hover:bg-bg-elevated'
              }`}
            >
              All Levels
            </button>
            {jlptLevels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedJLPT(level)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedJLPT === level
                    ? 'bg-indigo text-white'
                    : 'bg-bg-card text-text-secondary hover:bg-bg-elevated'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-text-secondary mb-2">No lessons found for the selected filters.</p>
              <p className="text-text-tertiary text-sm">Try adjusting your filters or check back later</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-6 rounded-xl border-2 ${getStatusColor(lesson.status)} transition-all ${
                  lesson.status !== 'locked' ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {getStatusIcon(lesson.status, lesson.crowns)}
                </div>

                {/* JLPT Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 text-xs font-bold bg-indigo text-white rounded">
                    {lesson.jlpt}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-8 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{lesson.title}</h3>
                    {lesson.titleJP && (
                      <JapaneseText text={lesson.titleJP} className="text-lg text-sakura" />
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">{lesson.description}</p>
                  
                  {/* XP and Category */}
                  <div className="flex items-center justify-between pt-2 border-t border-bg-elevated">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-warning">XP</span>
                      <span className="text-sm font-semibold">{lesson.xp} XP</span>
                    </div>
                    <span className="text-xs text-text-tertiary capitalize">{lesson.category}</span>
                  </div>
                </div>

                {/* Action Button */}
                {lesson.status !== 'locked' && (
                  <button
                    className={`mt-4 w-full py-2 rounded-lg font-medium transition-colors ${
                      lesson.status === 'completed'
                        ? 'bg-correct/20 text-correct hover:bg-correct/30'
                        : lesson.status === 'in-progress'
                        ? 'bg-sakura text-sumi hover:bg-sakura-dark'
                        : 'bg-indigo text-white hover:bg-indigo-dark'
                    }`}
                  >
                    {lesson.status === 'completed' ? 'Review' : lesson.status === 'in-progress' ? 'Continue' : 'Start'}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

