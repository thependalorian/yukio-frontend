'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { api } from '@/lib/api'
import { Trophy, Lock, CheckCircle2 } from 'lucide-react'
import type { Achievement, UserAchievement } from '@/lib/api'
import { getAchievementIcon, getCategoryIcon } from '@/lib/achievement-icons'

export default function AchievementsPage() {
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const userId = localStorage.getItem('yukio_user_id') || 'george_nekwaya'
        
        const [all, user] = await Promise.all([
          api.getAchievements(),
          api.getUserAchievements(userId)
        ])
        
        setAllAchievements(all)
        setUserAchievements(user)
      } catch (error: any) {
        console.error('Failed to fetch achievements:', error)
        setError(error.message || 'Failed to load achievements')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAchievements()
  }, [])

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-text-secondary">Loading achievements...</div>
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

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id))
  const categories = ['all', 'learning', 'vocab', 'pronunciation', 'streak', 'xp', 'jlpt', 'special']
  
  const filteredAchievements = selectedCategory === 'all'
    ? allAchievements
    : allAchievements.filter(ach => ach.category === selectedCategory)

  const rarityColors = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600'
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
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Trophy className="w-10 h-10 text-sakura" />
            Achievements
          </h1>
          <p className="text-text-secondary">
            Unlock achievements as you progress through your Japanese learning journey
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-bg-card border border-bg-elevated rounded-xl p-4">
            <div className="text-2xl font-bold text-sakura">{unlockedIds.size}</div>
            <div className="text-sm text-text-secondary">Unlocked</div>
          </div>
          <div className="bg-bg-card border border-bg-elevated rounded-xl p-4">
            <div className="text-2xl font-bold text-sakura">{allAchievements.length}</div>
            <div className="text-sm text-text-secondary">Total</div>
          </div>
          <div className="bg-bg-card border border-bg-elevated rounded-xl p-4">
            <div className="text-2xl font-bold text-sakura">
              {Math.round((unlockedIds.size / allAchievements.length) * 100)}%
            </div>
            <div className="text-sm text-text-secondary">Complete</div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-sakura text-sumi'
                  : 'bg-bg-card border border-bg-elevated text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredAchievements.map((achievement, index) => {
            const isUnlocked = unlockedIds.has(achievement.id)
            const userAch = userAchievements.find(ua => ua.achievement_id === achievement.id)
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative bg-bg-card border rounded-xl p-6 ${
                  isUnlocked
                    ? `border-sakura bg-gradient-to-br ${rarityColors[achievement.rarity]}`
                    : 'border-bg-elevated opacity-60'
                }`}
              >
                {/* Unlocked Badge */}
                {isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                )}

                {/* Locked Overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-bg-elevated/80 rounded-xl flex items-center justify-center">
                    <Lock className="w-12 h-12 text-text-tertiary" />
                  </div>
                )}

                {/* Achievement Content */}
                <div className="relative z-10">
                  {(() => {
                    const IconComponent = getAchievementIcon(achievement.icon)
                    return (
                      <div className="mb-3">
                        <IconComponent 
                          className={`w-12 h-12 ${isUnlocked ? 'text-white' : 'text-text-secondary'}`}
                        />
                      </div>
                    )
                  })()}
                  <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-text-primary'}`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-sm mb-4 ${isUnlocked ? 'text-white/90' : 'text-text-secondary'}`}>
                    {achievement.description}
                  </p>
                  
                  {/* Rarity Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${
                      isUnlocked
                        ? 'bg-white/20 text-white'
                        : 'bg-bg-elevated text-text-tertiary'
                    }`}>
                      {achievement.rarity.toUpperCase()}
                    </span>
                    <span className={`text-sm font-semibold ${isUnlocked ? 'text-white' : 'text-text-secondary'}`}>
                      +{achievement.xp_reward} XP
                    </span>
                  </div>

                  {/* Unlocked Date */}
                  {isUnlocked && userAch && (
                    <div className="mt-3 text-xs text-white/70">
                      Unlocked: {new Date(userAch.unlocked_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </PageWrapper>
  )
}

