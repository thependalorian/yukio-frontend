'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { getAchievementIcon } from '@/lib/achievement-icons'

interface AchievementNotificationProps {
  achievement: {
    id: string
    name: string
    description: string
    icon: string
    xp_reward: number
  } | null
  onClose: () => void
}

/**
 * Achievement unlock notification component
 * Displays when a user unlocks an achievement
 */
export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      
      // Trigger confetti animation
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }
      
      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()
        
        if (timeLeft <= 0) {
          return clearInterval(interval)
        }
        
        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 500) // Wait for animation to finish
      }, 5000)
      
      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    }
  }, [achievement, onClose])

  if (!achievement) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className="bg-gradient-to-r from-sakura to-sakura-dark rounded-xl p-6 shadow-2xl border-2 border-white/20">
            <div className="flex items-start gap-4">
              {/* Achievement Icon */}
              {(() => {
                const IconComponent = getAchievementIcon(achievement.icon)
                return (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex items-center justify-center"
                  >
                    <IconComponent className="w-12 h-12 text-white" />
                  </motion.div>
                )
              })()}

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-white" />
                  <h3 className="text-xl font-bold text-white">Achievement Unlocked!</h3>
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{achievement.name}</h4>
                <p className="text-sm text-white/90 mb-3">{achievement.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                    +{achievement.xp_reward} XP
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 500)
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar Animation */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

