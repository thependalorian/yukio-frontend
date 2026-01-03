'use client'

import { useState, useEffect, useRef } from 'react'
import Card from './UI/Card'
import Button from './UI/Button'
import { Send, Mic, MicOff, Wifi, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function AudioTutor() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isConnectingRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    // Initialize audio element
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
      audioRef.current.onended = () => setIsPlaying(false)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN || isConnectingRef.current) {
        return // Already connected or connecting
      }

      isConnectingRef.current = true
      console.log('Attempting WebSocket connection...')

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8058'
        const wsUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws'
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          if (!isMountedRef.current) return
          console.log('WebSocket connected successfully')
          isConnectingRef.current = false
          setIsConnected(true)
          toast.success('Connected to Yukio')
        }

        ws.onerror = (error) => {
          if (!isMountedRef.current) return
          console.error('WebSocket error:', error)
          isConnectingRef.current = false
          setIsConnected(false)
        }

        ws.onclose = (event) => {
          if (!isMountedRef.current) return
          console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`)
          isConnectingRef.current = false
          setIsConnected(false)

          // Don't reconnect if normal closure
          if (event.code !== 1000) {
            setTimeout(() => {
              if (isMountedRef.current) {
                console.log('Attempting to reconnect...')
                connectWebSocket()
              }
            }, 3000)
          }
        }

        ws.onmessage = async (event) => {
          if (!isMountedRef.current) return
          const data = JSON.parse(event.data)

          if (data.type === 'response') {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: data.message,
              timestamp: new Date().toISOString()
            }])
            setIsSending(false)

            // Play TTS audio for response
            await playTTS(data.message)
          } else if (data.type === 'error') {
            toast.error(data.message)
            setIsSending(false)
          }
        }
      } catch (error) {
        console.error('Failed to create WebSocket:', error)
        isConnectingRef.current = false
      }
    }

    connectWebSocket()

    return () => {
      isMountedRef.current = false
      isConnectingRef.current = false

      if (wsRef.current) {
        // Remove event listeners to prevent memory leaks
        wsRef.current.onopen = null
        wsRef.current.onerror = null
        wsRef.current.onclose = null
        wsRef.current.onmessage = null

        // Close only if connection is open or connecting
        if (wsRef.current.readyState === WebSocket.CONNECTING ||
            wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, 'Component unmounting')
        }

        wsRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !isConnected || isSending) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsSending(true)

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          message: input,
          include_rag: true
        }))
        setInput('')
      } else {
        toast.error('Not connected to server')
        setIsSending(false)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const playTTS = async (text: string) => {
    try {
      console.log('Requesting TTS for:', text)
      setIsPlaying(true)

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8058'
      const response = await fetch(`${backendUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })

      console.log('TTS response status:', response.status)

      if (response.ok) {
        const audioBlob = await response.blob()
        console.log('TTS audio blob size:', audioBlob.size, 'type:', audioBlob.type)

        // Create blob with explicit MIME type for WAV
        const wavBlob = new Blob([audioBlob], { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(wavBlob)
        console.log('Audio URL created:', audioUrl)

        if (audioRef.current) {
          // Load the audio first
          audioRef.current.src = audioUrl
          audioRef.current.load()
          console.log('Audio loaded, attempting to play...')

          try {
            const playPromise = audioRef.current.play()
            if (playPromise !== undefined) {
              await playPromise
              console.log('Audio playing')
              toast.success('Playing response')
            }
          } catch (playError: any) {
            console.error('Audio play error:', playError)
            console.error('Error name:', playError.name)
            console.error('Error message:', playError.message)

            if (playError.name === 'NotAllowedError') {
              toast.error('Click to enable audio playback')
            } else {
              toast.error('Could not play audio: ' + playError.message)
            }
          }
        } else {
          console.error('Audio element not initialized')
          toast.error('Audio element missing')
        }
      } else {
        console.error('TTS request failed:', response.status)
        const errorText = await response.text()
        console.error('Error details:', errorText)
        toast.error('TTS failed: ' + response.status)
      }
    } catch (error) {
      console.error('TTS playback error:', error)
      toast.error('TTS error: ' + error)
    } finally {
      setIsPlaying(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      // Try different MIME types in order of preference
      let mimeType = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus'
      }

      console.log('Using MIME type:', mimeType)

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        await transcribeAudio(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('Recording stopped')
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.wav')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8058'
      const response = await fetch(`${backendUrl}/api/transcribe`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setInput(data.text)
        toast.success('Transcribed!')
      } else {
        toast.error('Transcription failed')
      }
    } catch (error) {
      console.error('Transcription error:', error)
      toast.error('Could not transcribe audio')
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Interface */}
      <Card className="lg:col-span-2 flex flex-col h-[700px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Chat with Yukio</h3>
            <p className="text-sm text-gray-500">Your AI Japanese tutor</p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <Wifi size={18} />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <WifiOff size={18} />
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-blue-600">Hello</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Start a conversation with Yukio
              </h4>
              <p className="text-gray-500 max-w-md mx-auto">
                Ask questions, practice conversations, or request lessons about Japanese language and culture
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Button
            variant={isRecording ? 'danger' : 'ghost'}
            size="md"
            onClick={toggleRecording}
            className="shrink-0"
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message in Japanese or English..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected || isSending}
          />
          <Button
            variant="primary"
            size="md"
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected || isSending}
            isLoading={isSending}
            className="shrink-0"
          >
            <Send size={20} />
          </Button>
        </div>
      </Card>

      {/* Sidebar */}
      <Card className="h-[700px] flex flex-col">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>

        <div className="space-y-3 flex-1">
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={() => setInput("こんにちは！元気ですか？")}
          >
            <span className="text-sm font-medium">Hello</span>
            Practice greetings
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={() => setInput("Can you teach me basic hiragana?")}
          >
            <span className="text-lg">あ</span>
            Learn hiragana
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={() => setInput("Tell me about living in Tokyo")}
          >
            <span className="text-lg">🏙️</span>
            Living in Japan
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={() => setInput("What are common phrases for business meetings?")}
          >
            <span className="text-lg">💼</span>
            Business Japanese
          </Button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-900 font-medium mb-2">💡 Tip</p>
          <p className="text-xs text-blue-700">
            Yukio knows your goal of moving to Japan and can provide context-specific lessons for work and life there!
          </p>
        </div>
      </Card>
    </div>
  )
}
