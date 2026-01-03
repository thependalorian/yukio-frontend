'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface StreakFireProps {
  /** Current streak count */
  streak: number
  /** Show celebration on milestones */
  showCelebration?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const fireSizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
}

const milestones = [7, 30, 50, 100, 365]

/**
 * Animated fire emoji component for displaying streak
 *
 * @example
 * <StreakFire
 *   streak={12}
 *   showCelebration
 * />
 */
export function StreakFire({
  streak,
  showCelebration = true,
  size = 'md',
  className,
}: StreakFireProps) {
  const [previousStreak, setPreviousStreak] = useState(streak)
  const isMilestone = milestones.includes(streak)

  useEffect(() => {
    // Trigger celebration on milestone
    if (showCelebration && streak > previousStreak && isMilestone) {
      triggerCelebration()
    }
    setPreviousStreak(streak)
  }, [streak, previousStreak, isMilestone, showCelebration])

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFB7C5', '#4F46E5', '#F59E0B', '#22C55E'],
    })
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Animated fire */}
      <motion.span
        className={cn(fireSizes[size], 'text-warning font-bold')}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        STREAK
      </motion.span>

      {/* Streak count */}
      <div className="flex flex-col">
        <motion.span
          className={cn('font-bold text-warning', sizeClasses[size])}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {streak} Day{streak !== 1 ? 's' : ''}
        </motion.span>
        {isMilestone && (
          <span className="text-xs text-text-secondary">
            Milestone!
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Compact streak display for navigation
 */
interface CompactStreakProps {
  streak: number
  className?: string
}

export function CompactStreak({ streak, className }: CompactStreakProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <motion.span
        className="text-lg text-warning font-bold"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        STREAK
      </motion.span>
      <span className="text-sm font-semibold text-warning">
        {streak}
      </span>
    </div>
  )
}

/**
 * Streak card with freeze option
 */
interface StreakCardProps {
  streak: number
  hasFreeze: boolean
  onUseFreeze?: () => void
  className?: string
}

export function StreakCard({
  streak,
  hasFreeze,
  onUseFreeze,
  className,
}: StreakCardProps) {
  return (
    <div className={cn('bg-bg-card rounded-lg p-4 border border-bg-elevated', className)}>
      <div className="flex items-center justify-between mb-3">
        <StreakFire streak={streak} size="lg" showCelebration={false} />
      </div>

      <p className="text-sm text-text-secondary mb-4">
        Keep your streak alive by practicing every day!
      </p>

      {hasFreeze && (
        <motion.button
          onClick={onUseFreeze}
          className={cn(
            'w-full py-2 px-4 rounded-lg',
            'bg-gradient-to-r from-indigo to-indigo-dark',
            'text-white font-semibold text-sm',
            'hover:opacity-90 transition-opacity'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Use Streak Freeze
        </motion.button>
      )}

      {!hasFreeze && (
        <div className="text-xs text-text-tertiary text-center">
          Earn a streak freeze by practicing 7 days in a row
        </div>
      )}
    </div>
  )
}
