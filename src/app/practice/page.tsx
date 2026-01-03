'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PageWrapper } from '@/components/ui'
import { BookOpen, Mic, ArrowRight } from 'lucide-react'

const practiceTypes = [
  {
    title: 'Vocabulary Practice',
    description: 'Master Japanese words with interactive flashcards',
    href: '/practice/vocab',
    icon: BookOpen,
    color: 'from-sakura to-sakura-dark',
  },
  {
    title: 'Voice Practice',
    description: 'Improve your pronunciation with AI feedback',
    href: '/practice/voice',
    icon: Mic,
    color: 'from-indigo to-indigo-dark',
  },
]

export default function PracticePage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold">Practice</h1>
          <p className="text-text-secondary">
            Choose a practice mode to improve your Japanese skills
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practiceTypes.map((type, index) => (
            <motion.div
              key={type.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={type.href}>
                <div className="group bg-bg-card border border-bg-elevated rounded-xl p-8 hover:border-sakura transition-all cursor-pointer h-full">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <type.icon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-sakura transition-colors">
                        {type.title}
                      </h3>
                      <p className="text-text-secondary">{type.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sakura opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="font-medium">Start practicing</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}

