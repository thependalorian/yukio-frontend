/**
 * Achievement icon mapping utility
 * Maps achievement icon strings to Lucide React icons
 */

import {
  Target,
  BookOpen,
  Book,
  GraduationCap,
  Mic,
  Star,
  TrendingUp,
  Flame,
  Zap,
  Award,
  Trophy,
  Crown,
  Gem,
  MessageSquare,
  Brain,
  Palette,
  Calendar,
  Languages,
  BarChart3,
  Sparkles
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export const achievementIconMap: Record<string, LucideIcon> = {
  // Learning
  '🎯': Target,
  '📚': BookOpen,
  '📖': Book,
  '🏆': Trophy,
  
  // Vocabulary
  '📝': BookOpen,
  '🎓': GraduationCap,
  
  // Pronunciation
  '🎤': Mic,
  '⭐': Star,
  '🔥': Flame,
  '📈': TrendingUp,
  
  // Streaks
  '💪': Zap,
  '⚡': Zap,
  
  // XP & Levels
  '🌟': Star,
  '💫': Sparkles,
  '🏅': Award,
  
  // JLPT
  '🎌': Languages,
  '🎋': Languages,
  '🎍': Languages,
  '🎎': Languages,
  '🏯': Languages,
  
  // Special
  '💬': MessageSquare,
  '🧠': Brain,
  '🎨': Palette,
  
  // Default
  'default': Award
}

/**
 * Get icon component for achievement
 */
export function getAchievementIcon(iconString: string): LucideIcon {
  return achievementIconMap[iconString] || achievementIconMap['default']
}

/**
 * Get icon component by category
 */
export function getCategoryIcon(category: string): LucideIcon {
  const categoryMap: Record<string, LucideIcon> = {
    learning: BookOpen,
    vocab: Book,
    pronunciation: Mic,
    streak: Flame,
    xp: Star,
    jlpt: Languages,
    special: Award
  }
  return categoryMap[category] || Award
}

