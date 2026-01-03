'use client'

import { cn } from '@/lib/utils'

interface JapaneseTextProps {
  /** Main text (kanji/kana) */
  text: string
  /** Optional furigana reading */
  reading?: string
  /** Optional romaji */
  romaji?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Show furigana */
  showFurigana?: boolean
  /** Show romaji below */
  showRomaji?: boolean
  /** Additional CSS classes */
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
}

/**
 * Component for rendering Japanese text with optional furigana and romaji
 *
 * @example
 * <JapaneseText
 *   text="食べる"
 *   reading="たべる"
 *   romaji="taberu"
 *   showFurigana
 * />
 */
export function JapaneseText({
  text,
  reading,
  romaji,
  size = 'md',
  showFurigana = true,
  showRomaji = false,
  className,
}: JapaneseTextProps) {
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {/* Main text with optional furigana */}
      {showFurigana && reading ? (
        <ruby className={cn('japanese-text font-japanese', sizeClasses[size])}>
          {text}
          <rt>{reading}</rt>
        </ruby>
      ) : (
        <span className={cn('japanese-text font-japanese', sizeClasses[size])}>
          {text}
        </span>
      )}

      {/* Optional romaji */}
      {showRomaji && romaji && (
        <span className="text-xs text-text-secondary font-sans">
          {romaji}
        </span>
      )}
    </div>
  )
}

/**
 * Component for rendering full Japanese sentences with inline furigana
 * Uses space-separated format: "漢字[かんじ] text[reading]"
 */
interface JapaneseSentenceProps {
  /** Sentence with inline furigana notation */
  sentence: string
  /** Show furigana */
  showFurigana?: boolean
  className?: string
}

export function JapaneseSentence({
  sentence,
  showFurigana = true,
  className,
}: JapaneseSentenceProps) {
  // Parse sentence with format: "word[reading] other[other]"
  const parts = sentence.split(/\s+/)

  return (
    <div className={cn('japanese-text font-japanese text-lg', className)}>
      {parts.map((part, index) => {
        const match = part.match(/^(.+?)\[(.+?)\]$/)

        if (match && showFurigana) {
          const [, text, reading] = match
          return (
            <ruby key={index} className="mx-0.5">
              {text}
              <rt>{reading}</rt>
            </ruby>
          )
        }

        return (
          <span key={index} className="mx-0.5">
            {part}
          </span>
        )
      })}
    </div>
  )
}
