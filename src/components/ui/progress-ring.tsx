'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  /** Current progress value */
  progress: number
  /** Maximum value (defaults to 100) */
  max?: number
  /** Ring size in pixels */
  size?: number
  /** Stroke width */
  strokeWidth?: number
  /** Color of the progress arc */
  color?: string
  /** Background color of the ring */
  backgroundColor?: string
  /** Show percentage text */
  showPercentage?: boolean
  /** Custom label */
  label?: string
  /** Additional CSS classes */
  className?: string
  /** Children to render in center */
  children?: React.ReactNode
}

/**
 * Circular progress ring component
 *
 * @example
 * <ProgressRing
 *   progress={75}
 *   max={100}
 *   size={120}
 *   showPercentage
 * />
 */
export function ProgressRing({
  progress,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#4F46E5',
  backgroundColor = '#333333',
  showPercentage = true,
  label,
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100)
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            {showPercentage && (
              <motion.span
                className="text-2xl font-bold text-text-primary"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.round(percentage)}%
              </motion.span>
            )}
            {label && (
              <span className="text-xs text-text-secondary mt-1">
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Mini progress ring for compact displays
 */
interface MiniProgressRingProps {
  progress: number
  max?: number
  size?: number
  color?: string
  className?: string
}

export function MiniProgressRing({
  progress,
  max = 100,
  size = 40,
  color = '#4F46E5',
  className,
}: MiniProgressRingProps) {
  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100)

  return (
    <ProgressRing
      progress={progress}
      max={max}
      size={size}
      strokeWidth={4}
      color={color}
      backgroundColor="#333333"
      showPercentage={false}
      className={className}
    >
      <span className="text-xs font-semibold text-text-primary">
        {Math.round(percentage)}
      </span>
    </ProgressRing>
  )
}
