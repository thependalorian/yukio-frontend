'use client'

import { useState, useEffect } from 'react'
import Card from './UI/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, BookOpen, MessageCircle, Award } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProgressData {
  student_id: string
  total_questions: number
  total_sessions: number
  average_session_length: number
  vocabulary_learned: number
  grammar_points_covered: number
  conversation_turns: number
  session_history: Array<{
    session_id: string
    date: string
    duration_minutes: number
    questions_asked: number
    topics_covered: string[]
  }>
}

export default function ProgressDashboard() {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8058'
      const userId = localStorage.getItem('yukio_user_id') || 'george_nekwaya'
      const response = await fetch(`${backendUrl}/progress/${userId}`)
      if (response.ok) {
        const data = await response.json()
        // Transform backend response to match component's expected format
        setProgress({
          student_id: data.user_id || userId,
          total_questions: data.total_questions || 0,
          total_sessions: data.total_sessions || 0,
          average_session_length: data.average_session_length || 0,
          vocabulary_learned: data.vocabulary_learned || 0,
          grammar_points_covered: data.grammar_points_covered || 0,
          conversation_turns: data.conversation_turns || 0,
          session_history: data.session_history || []
        })
      } else {
        toast.error('Failed to load progress data')
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
      toast.error('Could not connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }

  if (!progress) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">No progress data available yet. Start learning to see your stats!</p>
        </div>
      </Card>
    )
  }

  const stats = [
    {
      label: 'Total Sessions',
      value: progress.total_sessions,
      icon: MessageCircle,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Questions Asked',
      value: progress.total_questions,
      icon: BookOpen,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Vocabulary Learned',
      value: progress.vocabulary_learned,
      icon: Award,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      label: 'Avg Session (min)',
      value: Math.round(progress.average_session_length),
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600'
    }
  ]

  // Prepare chart data from session history
  const sessionChartData = progress.session_history.slice(-7).map(session => ({
    date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    questions: session.questions_asked,
    duration: session.duration_minutes
  }))

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions per Session Chart */}
        <Card>
          <h3 className="text-lg font-bold mb-4">Questions per Session</h3>
          {sessionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sessionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="questions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No session data available yet
            </div>
          )}
        </Card>

        {/* Session Duration Chart */}
        <Card>
          <h3 className="text-lg font-bold mb-4">Session Duration (minutes)</h3>
          {sessionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sessionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No session data available yet
            </div>
          )}
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <h3 className="text-lg font-bold mb-4">Recent Sessions</h3>
        {progress.session_history.length > 0 ? (
          <div className="space-y-3">
            {progress.session_history.slice(-5).reverse().map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Session {session.session_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{session.questions_asked}</p>
                    <p className="text-gray-500">Questions</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{session.duration_minutes}</p>
                    <p className="text-gray-500">Minutes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{session.topics_covered.length}</p>
                    <p className="text-gray-500">Topics</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No sessions recorded yet. Start chatting with Yukio to build your learning history!
          </div>
        )}
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="text-yellow-600" size={24} />
          Achievements & Milestones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <p className="font-semibold text-gray-900">First Steps</p>
            <p className="text-sm text-gray-500">Started your journey</p>
          </div>
          {progress.total_sessions >= 5 && (
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-orange-500 mb-2">STREAK</div>
              <p className="font-semibold text-gray-900">Consistent Learner</p>
              <p className="text-sm text-gray-500">5+ sessions completed</p>
            </div>
          )}
          {progress.vocabulary_learned >= 50 && (
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-blue-500 mb-2">VOCAB</div>
              <p className="font-semibold text-gray-900">Vocabulary Master</p>
              <p className="text-sm text-gray-500">50+ words learned</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
