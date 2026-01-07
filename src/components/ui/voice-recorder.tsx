'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Volume2, Play, Square } from 'lucide-react'

interface VoiceRecorderProps {
  targetPhrase: string
  targetRomaji?: string
  targetEnglish?: string
  onRecordingComplete?: (audioBlob: Blob) => void
  onPlayback?: (audioUrl: string) => void
}

export function VoiceRecorder({
  targetPhrase,
  targetRomaji,
  targetEnglish,
  onRecordingComplete,
  onPlayback,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Use WebM format (better browser support), Whisper can handle it
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/ogg;codecs=opus'
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Use the same MIME type for the blob
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudio(audioUrl)
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Start audio level monitoring
      const updateAudioLevel = () => {
        if (!analyserRef.current) return

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average / 255)

        if (isRecording) {
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }
      updateAudioLevel()
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Microphone access denied. Please enable microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const playRecording = () => {
    if (recordedAudio) {
      const audio = new Audio(recordedAudio)
      setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
      audio.play()
      if (onPlayback) {
        onPlayback(recordedAudio)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Target Phrase */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold japanese-text">{targetPhrase}</h2>
        {targetRomaji && <p className="text-xl text-sakura">{targetRomaji}</p>}
        {targetEnglish && <p className="text-lg text-text-secondary">{targetEnglish}</p>}
      </div>

      {/* Recording Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-lg ${
            isRecording ? 'bg-wrong' : 'bg-sakura'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isRecording ? Infinity : 0 }}
        >
          {isRecording ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
      </div>

      {/* Recording Time */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-2xl font-bold">{formatTime(recordingTime)}</p>
        </motion.div>
      )}

      {/* Waveform Visualization */}
      <div className="flex items-end justify-center gap-1 h-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2 bg-sakura rounded-t"
            animate={{
              height: isRecording
                ? `${20 + Math.random() * 60 + audioLevel * 40}px`
                : '20px',
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>

      {/* Playback Controls */}
      {recordedAudio && !isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={playRecording}
            disabled={isPlaying}
            className="px-6 py-3 bg-indigo text-white rounded-lg font-semibold hover:bg-indigo-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
            Play Recording
          </button>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-text-secondary">
        {isRecording ? (
          <p>Recording... Click the button again to stop</p>
        ) : recordedAudio ? (
          <p>Listen to your recording and compare with the native pronunciation</p>
        ) : (
          <p>Click the microphone to start recording</p>
        )}
      </div>
    </div>
  )
}

