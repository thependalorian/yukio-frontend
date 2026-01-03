'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { ProgressRing, XPBadge, StreakFire } from '@/components/ui'
import { api } from '@/lib/api'
import { Trophy, BookOpen, Clock, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function ProgressPage() {
  const [userProgress, setUserProgress] = useState<any>(null)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [vocabStats, setVocabStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      try {
        const userId = localStorage.getItem('yukio_user_id') || 'george_nekwaya'
        const progress = await api.getUserProgress(userId)
        setUserProgress(progress)
        
        // Try to fetch stats (will fail until endpoint is implemented)
        try {
          const stats = await api.getProgressStats(userId)
          setWeeklyData(stats.weekly)
          setVocabStats(stats.vocab)
        } catch (statsError) {
          // Stats endpoint not yet implemented - show empty state
          setWeeklyData([])
          setVocabStats([])
        }
      } catch (error: any) {
        console.error('Failed to fetch progress:', error)
        setError(error.message || 'Failed to load progress')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProgress()
  }, [])

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-text-secondary">Loading progress...</div>
        </div>
      </PageWrapper>
    )
  }

  if (error || !userProgress) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-text-secondary mb-2">{error || 'Failed to load progress'}</p>
            <p className="text-text-tertiary text-sm">Please ensure the backend is running</p>
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
          <h1 className="text-3xl md:text-4xl font-bold">Your Progress</h1>
          <p className="text-text-secondary">Track your Japanese learning journey</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bg-card border border-bg-elevated rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-warning" />
              <div>
                <p className="text-sm text-text-secondary">Level</p>
                <p className="text-2xl font-bold">{userProgress.level}</p>
              </div>
            </div>
            <XPBadge xp={userProgress.xp} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-bg-card border border-bg-elevated rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <StreakFire streak={userProgress.streak} />
              <div>
                <p className="text-sm text-text-secondary">Day Streak</p>
                <p className="text-2xl font-bold">{userProgress.streak} days</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-bg-card border border-bg-elevated rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-sakura" />
              <div>
                <p className="text-sm text-text-secondary">JLPT Level</p>
                <p className="text-2xl font-bold">{userProgress.jlpt_level}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-bg-card border border-bg-elevated rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-indigo" />
              <div>
                <p className="text-sm text-text-secondary">Daily Goal</p>
                <p className="text-2xl font-bold">{userProgress.daily_goal} min</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-bg-card border border-bg-elevated rounded-xl p-6"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sakura" />
            Weekly Activity
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            {weeklyData.length > 0 ? (
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="day" stroke="#A1A1AA" />
                <YAxis stroke="#A1A1AA" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#262626',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#FFB7C5"
                  strokeWidth={2}
                  name="XP"
                />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  name="Minutes"
                />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-text-tertiary">
                No weekly data available yet
              </div>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Vocabulary Mastery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-bg-card border border-bg-elevated rounded-xl p-6"
        >
          <h2 className="text-xl font-bold mb-4">Vocabulary Mastery</h2>
          <ResponsiveContainer width="100%" height={300}>
            {vocabStats.length > 0 ? (
              <BarChart data={vocabStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="category" stroke="#A1A1AA" />
                <YAxis stroke="#A1A1AA" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#262626',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="learned" stackId="a" fill="#FFB7C5" name="Learned" />
                <Bar dataKey="mastered" stackId="a" fill="#22C55E" name="Mastered" />
                <Bar dataKey="reviewing" stackId="a" fill="#F59E0B" name="Reviewing" />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-text-tertiary">
                No vocabulary statistics available yet
              </div>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-bg-card border border-bg-elevated rounded-xl p-6"
        >
          <h2 className="text-xl font-bold mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'First Steps', icon: 'Beginner', unlocked: true },
              { name: 'Week Warrior', icon: 'Streak', unlocked: true },
              { name: 'Vocabulary Master', icon: 'Master', unlocked: false },
              { name: 'Perfect Week', icon: 'Perfect', unlocked: false },
            ].map((achievement) => (
              <div
                key={achievement.name}
                className={`p-4 rounded-lg text-center ${
                  achievement.unlocked
                    ? 'bg-sakura/20 border border-sakura'
                    : 'bg-bg-elevated border border-bg-card opacity-50'
                }`}
              >
                <div className="text-lg font-bold mb-2 text-sakura">{achievement.icon}</div>
                <p className="text-sm font-medium">{achievement.name}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}

