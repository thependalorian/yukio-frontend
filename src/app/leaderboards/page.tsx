'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { api } from '@/lib/api'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/api'

type LeaderboardCategory = 'weekly_xp' | 'monthly_xp' | 'all_time_xp' | 'weekly_streak' | 'monthly_streak' | 'pronunciation' | 'lessons'
type Period = 'weekly' | 'monthly' | 'all-time'

export default function LeaderboardsPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [category, setCategory] = useState<LeaderboardCategory>('weekly_xp')
  const [period, setPeriod] = useState<Period>('weekly')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRank, setUserRank] = useState<number | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true)
      const userId = localStorage.getItem('yukio_user_id') || 'george_nekwaya'
      
      const data = await api.getLeaderboard(category, period)
      setEntries(data)
      
      // Find user's rank
      const userEntry = data.find(e => e.user_id === userId)
      setUserRank(userEntry?.rank || null)
    } catch (error: any) {
      console.error('Failed to fetch leaderboard:', error)
      setError(error.message || 'Failed to load leaderboard')
    } finally {
      setIsLoading(false)
    }
  }, [category, period])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const categories = [
    { id: 'weekly_xp' as LeaderboardCategory, name: 'Weekly XP', icon: TrendingUp },
    { id: 'monthly_xp' as LeaderboardCategory, name: 'Monthly XP', icon: Trophy },
    { id: 'all_time_xp' as LeaderboardCategory, name: 'All-Time XP', icon: Award },
    { id: 'weekly_streak' as LeaderboardCategory, name: 'Weekly Streak', icon: Medal },
    { id: 'pronunciation' as LeaderboardCategory, name: 'Pronunciation', icon: Trophy },
  ]

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600'
    if (rank === 2) return 'from-gray-300 to-gray-500'
    if (rank === 3) return 'from-amber-600 to-amber-800'
    return 'from-bg-card to-bg-elevated'
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-text-secondary">Loading leaderboard...</div>
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
          </div>
        </div>
      </PageWrapper>
    )
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
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Trophy className="w-10 h-10 text-sakura" />
            Leaderboards
          </h1>
          <p className="text-text-secondary">
            Compete with other learners and see how you rank
          </p>
        </motion.div>

        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  category === cat.id
                    ? 'bg-sakura text-sumi'
                    : 'bg-bg-card border border-bg-elevated text-text-primary hover:bg-bg-elevated'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            )
          })}
        </motion.div>

        {/* Period Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          {(['weekly', 'monthly', 'all-time'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-sakura text-sumi'
                  : 'bg-bg-card border border-bg-elevated text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* User Rank Display */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-sakura to-sakura-dark rounded-xl p-4 text-center"
          >
            <p className="text-white font-semibold">
              Your Rank: <span className="text-2xl font-bold">{getRankIcon(userRank)}</span>
            </p>
          </motion.div>
        )}

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-card border border-bg-elevated rounded-xl overflow-hidden"
        >
          <div className="divide-y divide-bg-elevated">
            {entries.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                No entries yet. Be the first!
              </div>
            ) : (
              entries.map((entry, index) => {
                const userId = localStorage.getItem('yukio_user_id') || 'george_nekwaya'
                const isCurrentUser = entry.user_id === userId
                
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`p-4 flex items-center justify-between ${
                      isCurrentUser
                        ? `bg-gradient-to-r ${getRankColor(entry.rank)}`
                        : 'hover:bg-bg-elevated'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${
                        isCurrentUser ? 'text-white' : 'text-text-primary'
                      }`}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <div className={`font-semibold ${
                          isCurrentUser ? 'text-white' : 'text-text-primary'
                        }`}>
                          {entry.user_name || 'Anonymous'}
                        </div>
                        {isCurrentUser && (
                          <div className="text-xs text-white/80">You</div>
                        )}
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${
                      isCurrentUser ? 'text-white' : 'text-sakura'
                    }`}>
                      {entry.score.toLocaleString()}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}

