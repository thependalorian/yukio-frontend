'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { ChatBubble } from '@/components/ui/chat-bubble'
import { api } from '@/lib/api'
import { Send, Mic, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  isUser: boolean
  japaneseText?: string
  reading?: string
  romaji?: string
  timestamp: Date
}

const suggestedPrompts = [
  "Explain this grammar: ～ている",
  "How do I say 'Where is the station?'",
  "Quiz me on N5 vocabulary",
  "What's the difference between は and が?",
]

export default function ChatPage() {
  // Initialize messages as empty to avoid hydration issues
  // Add initial message after mount
  const [messages, setMessages] = useState<Message[]>([])
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    // Add initial welcome message after mount
    setMessages([
      {
        id: '1',
        content: 'こんにちは！I\'m Yukio, your Japanese language tutor. How can I help you learn today?',
        isUser: false,
        japaneseText: 'こんにちは',
        reading: 'こんにちは',
        romaji: 'konnichiwa',
        timestamp: new Date(),
      },
    ])
  }, [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Create assistant message placeholder (outside try block for error handling)
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      isUser: false,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      let fullResponse = ''
      let japaneseText: string | undefined
      let reading: string | undefined
      let romaji: string | undefined

      // Stream response
      for await (const chunk of api.chatStream({
        message: input,
        session_id: sessionId || undefined,
      })) {
        // Handle different event types
        if (chunk.type === 'text_delta' || chunk.type === 'text') {
          // Support both 'text_delta' and 'text' for backward compatibility
          const deltaText = chunk.text || chunk.content || ''
          if (deltaText) {
            fullResponse += deltaText
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: fullResponse }
                  : msg
              )
            )
          }
        } else if (chunk.type === 'response') {
          // Extract Japanese text if present
          const response = chunk.response || ''
          // Simple regex to find Japanese characters
          const japaneseMatch = response.match(/[ひらがなカタカナ漢字]+/g)
          if (japaneseMatch && japaneseMatch.length > 0) {
            japaneseText = japaneseMatch[0]
            // In a real implementation, you'd extract reading and romaji from the response
            reading = japaneseText
            romaji = '' // Would be extracted from response
          }
        } else if (chunk.type === 'session') {
          // Update session ID if provided
          if (chunk.session_id) {
            setSessionId(chunk.session_id)
          }
        } else if (chunk.type === 'end') {
          // Stream ended, break loop
          break
        } else if (chunk.type === 'error') {
          // Handle error
          console.error('Stream error:', chunk.content || chunk.message)
          throw new Error(chunk.content || chunk.message || 'Stream error')
        }
      }

      // Update final message with Japanese text
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, japaneseText, reading, romaji }
            : msg
        )
      )
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to get response. Please try again.')
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        {mounted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <h1 className="text-3xl font-bold mb-2">Chat with Yukio</h1>
            <p className="text-text-secondary">
              Practice Japanese conversation with your AI tutor
            </p>
          </motion.div>
        ) : (
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">Chat with Yukio</h1>
            <p className="text-text-secondary">
              Practice Japanese conversation with your AI tutor
            </p>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message) => {
            // Show loading indicator only for empty assistant messages while loading
            const showLoading = !message.isUser && !message.content.trim() && isLoading
            
            return (
              <ChatBubble
                key={message.id}
                message={message.content}
                isUser={message.isUser}
                japaneseText={message.japaneseText}
                reading={message.reading}
                romaji={message.romaji}
                timestamp={message.timestamp}
                isLoading={showLoading}
              />
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length === 1 && mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 space-y-2"
          >
            <p className="text-sm text-text-secondary">Suggested prompts:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="px-4 py-2 bg-bg-card border border-bg-elevated rounded-lg text-sm hover:bg-bg-elevated transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        {messages.length === 1 && !mounted && (
          <div className="mb-4 space-y-2">
            <p className="text-sm text-text-secondary">Suggested prompts:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="px-4 py-2 bg-bg-card border border-bg-elevated rounded-lg text-sm hover:bg-bg-elevated transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type your message or question..."
              className="w-full px-4 py-3 bg-bg-card border border-bg-elevated rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-sakura"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-sakura text-sumi rounded-lg font-semibold hover:bg-sakura-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
          <button
            className="px-4 py-3 bg-bg-card border border-bg-elevated rounded-lg hover:bg-bg-elevated transition-colors"
            title="Voice input (coming soon)"
          >
            <Mic className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}

