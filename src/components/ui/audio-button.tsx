'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioButtonProps {
  /** Text to synthesize */
  text: string
  /** API endpoint for TTS */
  ttsEndpoint?: string
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
  /** Callback when audio starts */
  onPlay?: () => void
  /** Callback when audio ends */
  onEnd?: () => void
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
}

/**
 * Button component for playing TTS audio
 *
 * @example
 * <AudioButton
 *   text="こんにちは"
 *   ttsEndpoint="/api/tts"
 *   size="md"
 * />
 */
export function AudioButton({
  text,
  ttsEndpoint = '/api/tts',
  size = 'md',
  className,
  onPlay,
  onEnd,
}: AudioButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlay = async () => {
    if (isLoading || isPlaying) return

    try {
      setIsLoading(true)

      // Use full backend URL if relative path is provided
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8058'
      const endpoint = ttsEndpoint.startsWith('http') ? ttsEndpoint : `${backendUrl}${ttsEndpoint}`
      
      // Call TTS API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('TTS request failed')
      }

      // Get audio blob
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onplay = () => {
        setIsPlaying(true)
        setIsLoading(false)
        onPlay?.()
      }

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
        onEnd?.()
      }

      audio.onerror = () => {
        setIsPlaying(false)
        setIsLoading(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
    } catch (error: any) {
      console.error('Audio playback error:', error)
      setIsLoading(false)
      setIsPlaying(false)
      
      // Show user-friendly error message
      if (error.name === 'NotAllowedError') {
        alert('Please allow audio playback in your browser settings')
      } else if (error.message?.includes('TTS request failed')) {
        alert('Failed to generate audio. Please check if the backend is running.')
      } else {
        console.error('Unknown audio error:', error)
      }
    }
  }

  return (
    <motion.button
      onClick={handlePlay}
      disabled={isLoading || isPlaying}
      className={cn(
        'flex items-center justify-center rounded-full',
        'bg-bg-card hover:bg-bg-elevated',
        'border border-bg-elevated',
        'text-text-primary',
        'transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isLoading ? 'Loading audio...' : isPlaying ? 'Playing...' : 'Play audio'}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.div>
      ) : isPlaying ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <span className="text-xs">AUDIO</span>
        </motion.div>
      ) : (
        <Volume2 className="w-5 h-5 text-text-primary" />
      )}
    </motion.button>
  )
}
