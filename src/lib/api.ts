/**
 * API Client for Yukio Backend
 * Connects to FastAPI backend running on localhost:8058
 * Backend uses LanceDB for local vector storage (no external database required)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8058'

/**
 * Health check types
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  lancedb: boolean
  memory: boolean
  llm_connection: boolean
  version: string
  timestamp: string
}

/**
 * Chat types
 */
export interface ChatRequest {
  message: string
  session_id?: string
  user_id?: string
  search_type?: 'vector' | 'hybrid'
  metadata?: Record<string, any>
}

export interface ToolCall {
  tool_name: string
  args: Record<string, any>
  tool_call_id?: string
}

export interface ChatResponse {
  message: string
  session_id: string
  tools_used: ToolCall[]
  metadata?: Record<string, any>
}

/**
 * Search types
 */
export interface SearchRequest {
  query: string
  limit?: number
}

export interface SearchResult {
  text: string
  metadata?: Record<string, any>
  score?: number
}

export interface SearchResponse {
  results: SearchResult[]
  total_results: number
  search_type: string
  query_time_ms: number
}

/**
 * User/Progress types for gamification
 */
export interface UserProgress {
  user_id: string
  name: string
  level: number
  xp: number
  xp_to_next_level: number
  streak: number
  daily_goal: number
  hearts: number
  jlpt_level: string
}

/**
 * API Client Class
 */
class YukioAPI {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthStatus> {
    const response = await fetch(`${this.baseURL}/health`)
    if (!response.ok) {
      throw new Error('Health check failed')
    }
    return response.json()
  }

  /**
   * Non-streaming chat
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('Chat request failed')
    }

    return response.json()
  }

  /**
   * Streaming chat using Server-Sent Events
   * Returns an async iterator that yields deltas
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<any, void, unknown> {
    const response = await fetch(`${this.baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('Stream request failed')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('Response body is not readable')
    }

    let buffer = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })
        
        // Process complete SSE messages (separated by \n\n)
        const parts = buffer.split('\n\n')
        // Keep the last incomplete part in buffer
        buffer = parts.pop() || ''
        
        for (const part of parts) {
          // Skip empty parts
          if (!part.trim()) continue
          
          // Find data lines (SSE format: "data: {...}")
          const lines = part.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data) {
                try {
                  const parsed = JSON.parse(data)
                  yield parsed
                } catch (e) {
                  console.error('Failed to parse SSE data:', e, 'Data:', data)
                }
              }
            }
          }
        }
      }
      
      // Process any remaining data in buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data) {
              try {
                const parsed = JSON.parse(data)
                yield parsed
              } catch (e) {
                console.error('Failed to parse final SSE data:', e)
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Vector search
   */
  async searchVector(query: string, limit: number = 5): Promise<SearchResponse> {
    const response = await fetch(`${this.baseURL}/search/vector`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    })

    if (!response.ok) {
      throw new Error('Vector search failed')
    }

    return response.json()
  }

  /**
   * Hybrid search
   */
  async searchHybrid(query: string, limit: number = 5): Promise<SearchResponse> {
    const response = await fetch(`${this.baseURL}/search/hybrid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    })

    if (!response.ok) {
      throw new Error('Hybrid search failed')
    }

    return response.json()
  }

  /**
   * List documents
   */
  async listDocuments(limit: number = 20, offset: number = 0): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/documents?limit=${limit}&offset=${offset}`
    )

    if (!response.ok) {
      throw new Error('Document listing failed')
    }

    return response.json()
  }

  /**
   * Get session info
   */
  async getSession(sessionId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/sessions/${sessionId}`)

    if (!response.ok) {
      throw new Error('Session retrieval failed')
    }

    return response.json()
  }

  /**
   * Get user progress from backend
   */
  async getUserProgress(userId: string): Promise<UserProgress> {
    const response = await fetch(`${this.baseURL}/progress/${userId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user progress: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Record user progress (lesson completion, vocab learned, etc.)
   */
  async recordProgress(userId: string, record: {
    progress_type: 'lesson' | 'vocab' | 'quiz' | 'xp' | 'streak'
    item_id: string
    status: 'completed' | 'in_progress' | 'locked' | 'mastered'
    data?: Record<string, any>
    xp_earned?: number
    crowns?: number
  }): Promise<{ id: string; status: string }> {
    const response = await fetch(`${this.baseURL}/progress/${userId}/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    })

    if (!response.ok) {
      throw new Error('Failed to record progress')
    }

    return response.json()
  }

  /**
   * Get user's lesson/vocab progress records
   */
  async getUserLessons(userId: string, progressType?: string): Promise<{ records: any[]; total: number }> {
    const url = new URL(`${this.baseURL}/progress/${userId}/lessons`)
    if (progressType) {
      url.searchParams.append('progress_type', progressType)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error('Failed to fetch user lessons')
    }

    return response.json()
  }

  /**
   * Get lessons from backend (generated from RAG data)
   */
  async getLessons(category?: string, jlpt?: string, limit: number = 20): Promise<any[]> {
    const url = new URL(`${this.baseURL}/lessons`)
    if (category) url.searchParams.append('category', category)
    if (jlpt) url.searchParams.append('jlpt', jlpt)
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Failed to fetch lessons: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get vocabulary words from backend (extracted from RAG data)
   */
  async getVocabulary(jlpt?: string, limit: number = 50): Promise<any[]> {
    const url = new URL(`${this.baseURL}/vocabulary`)
    if (jlpt) url.searchParams.append('jlpt', jlpt)
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get quiz questions from backend (generated from RAG data)
   */
  async getQuizQuestions(lessonId?: string, jlpt?: string, limit: number = 10): Promise<any[]> {
    const url = new URL(`${this.baseURL}/quiz/questions`)
    if (lessonId) url.searchParams.append('lesson_id', lessonId)
    if (jlpt) url.searchParams.append('jlpt', jlpt)
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Failed to fetch quiz questions: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get voice practice phrases from backend (extracted from RAG data)
   */
  async getVoicePhrases(difficulty?: string, category?: string, limit: number = 20): Promise<any[]> {
    const url = new URL(`${this.baseURL}/voice/phrases`)
    if (difficulty) url.searchParams.append('difficulty', difficulty)
    if (category) url.searchParams.append('category', category)
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Failed to fetch voice phrases: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get user progress statistics (weekly data, vocab stats)
   */
  async getProgressStats(userId: string): Promise<{ weekly: any[]; vocab: any[] }> {
    const response = await fetch(`${this.baseURL}/progress/${userId}/stats`)

    if (!response.ok) {
      throw new Error(`Failed to fetch progress stats: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Generate Japanese resume (履歴書) or work history (職務経歴書)
   */
  async generateRirekisho(
    userId: string,
    options: {
      jobTitle?: string
      companyName?: string
      jobDescription?: string
      documentType?: 'rirekisho' | 'shokumu-keirekisho' | 'both'
    } = {}
  ): Promise<RirekishoResponse> {
    const response = await fetch(`${this.baseURL}/career/rirekisho`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        job_title: options.jobTitle,
        company_name: options.companyName,
        job_description: options.jobDescription,
        document_type: options.documentType || 'rirekisho',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate rirekisho: ${response.statusText}`)
    }

    return response.json()
  }
}

/**
 * Rirekisho types
 */
export interface RirekishoSection {
  section_name: string
  section_name_jp: string
  content: string
  content_jp?: string
}

export interface RirekishoResponse {
  user_id: string
  document_type: string
  sections: RirekishoSection[]
  generated_at: string
  job_title?: string
  company_name?: string
}

// Export singleton instance
export const api = new YukioAPI()

// Export class for custom instances
export { YukioAPI }
