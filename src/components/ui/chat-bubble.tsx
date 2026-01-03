'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { JapaneseText } from './japanese-text'
import { AudioButton } from './audio-button'
import { Volume2, Eye, EyeOff, Languages, Loader2 } from 'lucide-react'

interface ChatBubbleProps {
  message: string
  isUser: boolean
  japaneseText?: string
  reading?: string
  romaji?: string
  timestamp?: Date
  showFurigana?: boolean
  showRomaji?: boolean
  onToggleFurigana?: () => void
  onToggleRomaji?: () => void
  isLoading?: boolean
}

export function ChatBubble({
  message,
  isUser,
  japaneseText,
  reading,
  romaji,
  timestamp,
  showFurigana = true,
  showRomaji = false,
  onToggleFurigana,
  onToggleRomaji,
  isLoading = false,
}: ChatBubbleProps) {
  const [localShowFurigana, setLocalShowFurigana] = useState(showFurigana)
  const [localShowRomaji, setLocalShowRomaji] = useState(showRomaji)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggleFurigana = () => {
    setLocalShowFurigana(!localShowFurigana)
    if (onToggleFurigana) onToggleFurigana()
  }

  const handleToggleRomaji = () => {
    setLocalShowRomaji(!localShowRomaji)
    if (onToggleRomaji) onToggleRomaji()
  }

  const bubbleContent = (
    <div
      className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 ${
        isUser
          ? 'bg-sakura text-sumi rounded-br-sm'
          : 'bg-bg-card border border-bg-elevated rounded-bl-sm'
      }`}
    >
      {/* Japanese Text with Controls */}
      {japaneseText && !isUser && (
        <div className="mb-2 space-y-2">
          <div className="flex items-center gap-2">
            <JapaneseText
              text={japaneseText}
              reading={reading}
              romaji={romaji}
              showFurigana={localShowFurigana}
              showRomaji={localShowRomaji}
              size="lg"
            />
            <div className="flex gap-1 ml-2">
              <button
                onClick={handleToggleFurigana}
                className="p-1 hover:bg-bg-elevated rounded transition-colors"
                title="Toggle furigana"
              >
                {localShowFurigana ? (
                  <Eye className="w-4 h-4 text-text-secondary" />
                ) : (
                  <EyeOff className="w-4 h-4 text-text-secondary" />
                )}
              </button>
              <button
                onClick={handleToggleRomaji}
                className="p-1 hover:bg-bg-elevated rounded transition-colors"
                title="Toggle romaji"
              >
                <Languages className="w-4 h-4 text-text-secondary" />
              </button>
              <AudioButton text={japaneseText} className="p-1" />
            </div>
          </div>
        </div>
      )}

      {/* Main Message */}
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-sakura" />
          <span className="text-text-tertiary text-sm">Yukio is thinking...</span>
        </div>
      ) : isUser ? (
        // User messages: plain text (no markdown)
        <p className="text-sumi whitespace-pre-wrap">
          {message || '\u00A0'}
        </p>
      ) : (
        // Assistant messages: render markdown
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styling for markdown elements
              h1: ({ children }) => (
                <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-text-primary">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold mb-2 mt-4 first:mt-0 text-text-primary">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0 text-text-primary">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-3 last:mb-0 text-text-primary leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside mb-3 space-y-1.5 text-text-primary ml-4">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside mb-3 space-y-1.5 text-text-primary ml-4">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-text-primary leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-text-primary">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-text-primary">{children}</em>
              ),
              code: ({ children, className }) => {
                const isInline = !className
                return isInline ? (
                  <code className="bg-bg-elevated px-1.5 py-0.5 rounded text-sm font-mono text-text-primary">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-bg-elevated p-3 rounded-lg text-sm font-mono text-text-primary overflow-x-auto mb-3">
                    <code>{children}</code>
                  </pre>
                )
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-sakura pl-4 my-3 italic text-text-secondary">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="my-4 border-bg-elevated" />
              ),
            }}
          >
            {message || '\u00A0'}
          </ReactMarkdown>
        </div>
      )}

      {/* Timestamp */}
      {timestamp && (
        <p className={`text-xs mt-2 ${
          isUser ? 'text-sumi/70' : 'text-text-tertiary'
        }`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {mounted ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {bubbleContent}
        </motion.div>
      ) : (
        bubbleContent
      )}
    </div>
  )
}

