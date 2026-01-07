'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { ChatBubble } from '@/components/ui/chat-bubble'
import { api } from '@/lib/api'
import { Send, Mic, Loader2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ResumeSection {
  section_name: string
  section_name_jp: string
  content: string
  content_jp?: string
}

interface Message {
  id: string
  content: string
  isUser: boolean
  japaneseText?: string
  reading?: string
  romaji?: string
  timestamp: Date
  resumeData?: {
    sections: ResumeSection[]
    documentType?: string
    jobTitle?: string
    companyName?: string
  }
}

const suggestedPrompts = [
  "Explain this grammar: ～ている",
  "How do I say 'Where is the station?'",
  "Quiz me on N5 vocabulary",
  "What's the difference between は and が?",
  "Please review my resume",
  "Help me create a rirekisho for a data analyst position",
]

const STORAGE_KEY = 'yukio_chat_history'
const SESSION_KEY = 'yukio_chat_session_id'

export default function ChatPage() {
  // Initialize messages as empty to avoid hydration issues
  // Add initial message after mount
  const [messages, setMessages] = useState<Message[]>([])
  const [mounted, setMounted] = useState(false)
  
  // Load chat history from localStorage on mount
  useEffect(() => {
    setMounted(true)
    
    // Load session ID
    const savedSessionId = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null
    if (savedSessionId) {
      setSessionId(savedSessionId)
    }
    
    // Load messages from localStorage
    try {
      const savedMessages = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages)
        // Convert timestamp strings back to Date objects
        const restoredMessages: Message[] = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(restoredMessages)
      } else {
        // No saved messages, add initial welcome message
        setMessages([
          {
            id: '1',
            content: 'こんにちは、George！I\'m Yukio (由紀夫), your Japanese language tutor and career coach. How can I help you learn today?',
            isUser: false,
            japaneseText: 'こんにちは',
            reading: 'こんにちは',
            romaji: 'konnichiwa',
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      // Fallback to initial message if loading fails
      setMessages([
        {
          id: '1',
          content: 'こんにちは、George！I\'m Yukio (由紀夫), your Japanese language tutor and career coach. How can I help you learn today?',
          isUser: false,
          japaneseText: 'こんにちは',
          reading: 'こんにちは',
          romaji: 'konnichiwa',
          timestamp: new Date(),
        },
      ])
    }
  }, [])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (mounted && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch (error) {
        console.error('Error saving chat history:', error)
      }
    }
  }, [messages, mounted])
  
  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (mounted && sessionId) {
      try {
        localStorage.setItem(SESSION_KEY, sessionId)
      } catch (error) {
        console.error('Error saving session ID:', error)
      }
    }
  }, [sessionId, mounted])
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
            // Save to localStorage immediately
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(SESSION_KEY, chunk.session_id)
              } catch (error) {
                console.error('Error saving session ID:', error)
              }
            }
          }
        } else if (chunk.type === 'tts_ready') {
          // TTS audio is ready, play it automatically
          const audioPath = chunk.audio_path || '/api/audio/tts_output.wav'
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8058'
          const fullAudioUrl = audioPath.startsWith('http') ? audioPath : `${backendUrl}${audioPath}`
          
          // Create audio element and play automatically
          const audio = new Audio(fullAudioUrl)
          audio.play().catch((error) => {
            console.error('Failed to play TTS audio:', error)
            toast.error('Failed to play audio. Please check your connection.')
          })
          
          // Optional: Log when audio finishes
          audio.addEventListener('ended', () => {
            console.log('TTS audio playback completed')
          })
        } else if (chunk.type === 'end') {
          // Stream ended, break loop
          break
        } else if (chunk.type === 'error') {
          // Handle error
          console.error('Stream error:', chunk.content || chunk.message)
          throw new Error(chunk.content || chunk.message || 'Stream error')
        }
      }

      // Extract Japanese text from full response (improved extraction)
      const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g
      const japaneseMatches = fullResponse.match(japaneseRegex)
      if (japaneseMatches && japaneseMatches.length > 0) {
        // Use the first significant Japanese text found (at least 2 characters)
        const significantMatch = japaneseMatches.find(m => m.length >= 2)
        if (significantMatch) {
          japaneseText = significantMatch
          reading = significantMatch
          romaji = '' // Could be enhanced with romaji conversion
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

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      // Clear messages and reset to initial welcome message
      const welcomeMessage: Message = {
        id: '1',
        content: 'こんにちは、George！I\'m Yukio (由紀夫), your Japanese language tutor and career coach. How can I help you learn today?',
        isUser: false,
        japaneseText: 'こんにちは',
        reading: 'こんにちは',
        romaji: 'konnichiwa',
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
      setSessionId(null)
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(SESSION_KEY)
        } catch (error) {
          console.error('Error clearing chat history:', error)
        }
      }
    }
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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Chat with Yukio</h1>
                <p className="text-text-secondary">
                  Practice Japanese conversation and get career coaching from your AI tutor
                </p>
              </div>
              {messages.length > 1 && (
                <button
                  onClick={handleClearChat}
                  className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors flex items-center gap-2"
                  title="Clear chat history"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Chat with Yukio</h1>
                <p className="text-text-secondary">
                  Practice Japanese conversation and get career coaching from your AI tutor
                </p>
              </div>
              {messages.length > 1 && (
                <button
                  onClick={handleClearChat}
                  className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors flex items-center gap-2"
                  title="Clear chat history"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
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
                resumeData={message.resumeData}
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

