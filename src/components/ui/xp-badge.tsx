'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface XPBadgeProps {
  /** Current XP amount */
  xp: number
  /** Show XP gain animation */
  showGain?: boolean
  /** Amount of XP gained */
  gainAmount?: number
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
}

/**
 * Badge component for displaying XP with optional gain animation
 *
 * @example
 * <XPBadge
 *   xp={1250}
 *   showGain
 *   gainAmount={10}
 * />
 */
export function XPBadge({
  xp,
  showGain = false,
  gainAmount = 0,
  size = 'md',
  className,
}: XPBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (showGain && gainAmount > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showGain, gainAmount])

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {/* Main XP Badge */}
      <motion.div
        className={cn(
          'flex items-center gap-1.5 rounded-full',
          'bg-gradient-to-r from-warning to-yellow-500',
          'text-sumi font-bold',
          'shadow-lg',
          sizeClasses[size]
        )}
        animate={isAnimating ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{ duration: 0.3 }}
      >
        <span className="text-sm font-bold">XP</span>
        <span>{xp.toLocaleString()} XP</span>
      </motion.div>

      {/* XP Gain Animation */}
      <AnimatePresence>
        {isAnimating && gainAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: 1, y: -40, x: 10 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute left-0 top-0 pointer-events-none"
          >
            <div className="text-lg font-bold text-warning drop-shadow-lg">
              +{gainAmount} XP
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Compact XP display for navigation bars
 */
interface CompactXPProps {
  xp: number
  level: number
  className?: string
}

export function CompactXP({ xp, level, className }: CompactXPProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Level Badge */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo to-indigo-dark text-white font-bold text-sm">
        {level}
      </div>

      {/* XP Display */}
      <div className="flex flex-col">
        <span className="text-xs text-text-secondary">Level {level}</span>
        <span className="text-sm font-semibold text-text-primary">
          {xp.toLocaleString()} XP
        </span>
      </div>
    </div>
  )
}

/**
 * Level progress bar with XP
 */
interface LevelProgressProps {
  currentXP: number
  requiredXP: number
  level: number
  className?: string
}

export function LevelProgress({
  currentXP,
  requiredXP,
  level,
  className,
}: LevelProgressProps) {
  const percentage = Math.min((currentXP / requiredXP) * 100, 100)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Level and XP */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">
          Level {level}
        </span>
        <span className="text-xs text-text-secondary">
          {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-bg-card rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-warning to-yellow-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
