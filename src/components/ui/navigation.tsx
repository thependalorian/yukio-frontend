'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CompactXP } from './xp-badge'
import { CompactStreak } from './streak-fire'
import { api, type UserProgress } from '@/lib/api'

interface NavItem {
  href: string
  label: string
  icon: string
  activeIcon?: string
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: '⌂',
    activeIcon: '⌂',
  },
  {
    href: '/lessons',
    label: 'Lessons',
    icon: '≡',
    activeIcon: '≡',
  },
  {
    href: '/practice',
    label: 'Practice',
    icon: '✎',
    activeIcon: '✎',
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: '◉',
    activeIcon: '◉',
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: '▣',
    activeIcon: '▣',
  },
]

/**
 * Main navigation component
 * - Bottom bar on mobile (< 1024px)
 * - Sidebar on desktop (>= 1024px)
 */
export function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserProgress() {
      try {
        // Get user ID from localStorage or use default
        const userId = localStorage.getItem('yukio_user_id') || 'george_nekwaya'
        
        // Fetch user progress from API
        const progress = await api.getUserProgress(userId)
        setUser(progress)
      } catch (error) {
        console.error('Failed to fetch user progress:', error)
        // On error, user remains null and user info section won't display
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProgress()
  }, [])

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 bg-bg-secondary border-r border-bg-elevated z-40">
        {/* Logo */}
        <div className="p-6 border-b border-bg-elevated">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sakura to-sakura-dark rounded-xl flex items-center justify-center text-white font-bold text-xl">
              ゆ
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Yukio</h1>
              <p className="text-xs text-text-secondary">Japanese Tutor</p>
            </div>
          </Link>
        </div>

        {/* User info */}
        {!isLoading && user && (
          <div className="p-4 border-b border-bg-elevated space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                <p className="text-xs text-text-secondary">Level {user.level} • {user.jlpt_level}</p>
              </div>
            </div>
            <CompactXP xp={user.xp} level={user.level} />
            <CompactStreak streak={user.streak} />
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && (
          <div className="p-4 border-b border-bg-elevated">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-bg-card rounded w-3/4"></div>
              <div className="h-4 bg-bg-card rounded w-1/2"></div>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative',
                  isActive
                    ? 'bg-bg-elevated text-text-primary'
                    : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-sakura rounded-r"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-xl">
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-bg-elevated">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
          >
            <span className="text-sm font-bold">SET</span>
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Bar (hidden on desktop) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-bg-elevated z-50 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[64px] relative',
                  isActive
                    ? 'text-text-primary'
                    : 'text-text-secondary'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-sakura rounded-b"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-2xl">
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                </span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer for mobile bottom bar */}
      <div className="lg:hidden h-20" />
    </>
  )
}

/**
 * Page wrapper that accounts for navigation layout
 */
interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn('lg:ml-64 min-h-screen', className)}>
      <main className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        {children}
      </main>
    </div>
  )
}
