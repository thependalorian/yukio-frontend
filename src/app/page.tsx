'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { api } from '@/lib/api'
import type { HealthStatus } from '@/lib/api'

export default function Dashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkHealth() {
      try {
        const status = await api.healthCheck()
        setHealth(status)
      } catch (error) {
        console.error('Health check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkHealth()
  }, [])

  const quickActions = [
    {
      href: '/chat',
      title: 'Chat with Yukio',
      description: 'Practice conversation with your AI tutor',
      icon: '◉',
      color: 'from-sakura to-sakura-dark',
    },
    {
      href: '/lessons',
      title: 'Browse Lessons',
      description: 'Explore structured Japanese lessons',
      icon: '≡',
      color: 'from-indigo to-indigo-dark',
    },
    {
      href: '/practice',
      title: 'Practice Vocabulary',
      description: 'Review and master new words',
      icon: '✎',
      color: 'from-matcha to-green-600',
    },
    {
      href: '/progress',
      title: 'View Progress',
      description: 'Track your learning journey',
      icon: '▣',
      color: 'from-warning to-yellow-500',
    },
  ]

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="japanese-text">こんにちは</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Welcome back to your Japanese learning journey
          </p>
        </motion.div>

        {/* System Status */}
        {!isLoading && health && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-bg-card border border-bg-elevated rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health.status === 'healthy'
                      ? 'bg-correct'
                      : health.status === 'degraded'
                      ? 'bg-warning'
                      : 'bg-wrong'
                  }`}
                />
                <span className="text-sm font-medium">
                  System Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-text-secondary">
                <span>LanceDB: {health.lancedb ? 'OK' : 'OFF'}</span>
                <span>LLM: {health.llm_connection ? 'OK' : 'OFF'}</span>
                <span>v{health.version}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <div className="group bg-bg-card border border-bg-elevated rounded-lg p-6 hover:border-sakura transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 group-hover:scale-110 transition-transform`}
                    >
                      {action.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-sakura transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {action.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-6 h-6 text-sakura"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Getting Started Guide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-bg-card border border-bg-elevated rounded-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4">Getting Started with Yukio</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sakura flex items-center justify-center text-sumi text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Start a conversation</p>
                <p className="text-sm text-text-secondary">
                  Chat with Yukio to practice Japanese and ask questions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sakura flex items-center justify-center text-sumi text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Explore lessons</p>
                <p className="text-sm text-text-secondary">
                  Browse structured lessons from the knowledge base
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sakura flex items-center justify-center text-sumi text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Practice regularly</p>
                <p className="text-sm text-text-secondary">
                  Use vocabulary practice and quizzes to reinforce learning
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
