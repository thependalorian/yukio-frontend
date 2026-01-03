# Yukio Frontend - Japanese Learning Web Application

Modern, Duolingo-inspired Japanese language learning web application built with Next.js 14, TypeScript, and Tailwind CSS. Connects to the Yukio backend API for AI-powered tutoring and progress tracking.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_BACKEND_URL=http://localhost:8058

# Start development server
npm run dev
```

Open http://localhost:3000

**Backend must be running** on http://localhost:8058

## Features

### Core Learning Features
- ✅ **Dashboard**: Overview of learning progress, quick actions, and daily goals
- ✅ **Lessons**: Browse and complete structured Japanese lessons (dynamically generated from RAG data)
- ✅ **Vocabulary Practice**: Flashcard-style vocabulary learning with multiple practice modes
- ✅ **Quiz**: Interactive quizzes with multiple question types (multiple-choice, type-answer, match, listen)
- ✅ **Voice Practice**: Pronunciation practice with audio recording and feedback
- ✅ **AI Tutor Chat**: Real-time conversation with Yukio AI tutor using Server-Sent Events (SSE)
- ✅ **Progress Tracking**: Track XP, level, streak, vocabulary mastery, and weekly activity

### Technical Features
- ✅ **No Mock Data**: All features use real backend API endpoints
- ✅ **Real-time Updates**: SSE streaming for chat responses
- ✅ **Progress Persistence**: User progress stored in LanceDB via backend
- ✅ **Responsive Design**: Mobile-first design with desktop sidebar navigation
- ✅ **Modern UI**: Duolingo-inspired design with smooth animations

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Dashboard
│   ├── lessons/                 # Lessons page
│   ├── practice/
│   │   ├── vocab/              # Vocabulary practice
│   │   └── voice/              # Voice practice
│   ├── quiz/                   # Quiz page
│   ├── chat/                   # AI tutor chat
│   ├── progress/               # Progress & statistics
│   └── settings/               # User settings
├── components/
│   └── ui/                     # Reusable UI components
│       ├── navigation.tsx      # Sidebar/bottom nav
│       ├── xp-badge.tsx       # XP display
│       ├── streak-fire.tsx    # Streak counter
│       ├── flash-card.tsx     # Vocabulary flashcards
│       ├── voice-recorder.tsx # Audio recording
│       └── ...
├── lib/
│   ├── api.ts                  # Backend API client
│   └── utils.ts                # Utility functions
└── styles/
    └── globals.css             # Global styles
```

## API Integration

### Backend Connection

The frontend connects to the Yukio backend API. Configure the backend URL in `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8058
```

### API Endpoints Used

#### Learning Content (RAG-Generated)
- `GET /lessons` - Get structured lessons (generated from ingested materials)
- `GET /vocabulary` - Get vocabulary words (extracted from materials)
- `GET /quiz/questions` - Get quiz questions (generated from materials)
- `GET /voice/phrases` - Get voice practice phrases (extracted from materials)

#### Chat & Search
- `POST /chat/stream` - Stream chat responses (SSE)
- `POST /search/vector` - Vector similarity search
- `POST /search/hybrid` - Hybrid search

#### Progress Tracking
- `GET /progress/{user_id}` - Get user progress (XP, level, streak, etc.)
- `POST /progress/{user_id}/record` - Record progress events
- `GET /progress/{user_id}/lessons` - Get user's lesson/vocab records
- `GET /progress/{user_id}/stats` - Get progress statistics (weekly, vocab mastery)

#### System
- `GET /health` - Health check

### API Client

The frontend uses a centralized API client (`src/lib/api.ts`) that:
- Handles all HTTP requests to the backend
- Provides TypeScript types for all responses
- Includes proper error handling
- Supports query parameters and filtering

Example usage:
```typescript
import { api } from '@/lib/api'

// Get lessons
const lessons = await api.getLessons('grammar', 'N5', 20)

// Get vocabulary
const vocab = await api.getVocabulary('N5', 50)

// Record progress
await api.recordProgress(userId, {
  progress_type: 'lesson',
  item_id: 'lesson-123',
  status: 'completed',
  xp_earned: 20,
  crowns: 1
})
```

## Configuration

### Environment Variables (.env.local)

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8058

# Optional: Alternative API URL variable name
NEXT_PUBLIC_API_URL=http://localhost:8058
```

### User ID Storage

The frontend uses `localStorage` to persist user ID:
- Key: `yukio_user_id`
- Default: `default_user` if not set
- Used for progress tracking and personalization

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **State Management**: React hooks (useState, useEffect)
- **API Communication**: Fetch API with SSE support

## Development

```bash
# Install dependencies
npm install

# Run development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

## Design System

The frontend follows a Duolingo-inspired design with:

### Color Palette
- **Sakura Pink**: Primary brand color (`#FFB7C5`)
- **Sumi Black**: Text and dark elements (`#1A1A1A`)
- **Matcha Green**: Success and positive actions
- **Indigo**: Secondary actions and links
- **Warning Yellow**: Streaks and achievements

### Typography
- **Display Font**: Cal Sans (headings)
- **Body Font**: Inter (body text)
- **Japanese Text**: System fonts with proper fallbacks

### Components
All UI components are in `src/components/ui/` and follow consistent patterns:
- Accessible (keyboard navigation, ARIA labels)
- Responsive (mobile-first design)
- Animated (smooth transitions with Framer Motion)
- Type-safe (TypeScript interfaces)

## Features by Page

### Dashboard (`/`)
- Welcome message with user name
- Quick action cards (Chat, Lessons, Practice, Progress)
- Daily goal progress
- Recent activity summary
- System status (LanceDB, LLM connection)

### Lessons (`/lessons`)
- Filter by category (Hiragana, Katakana, Kanji, Grammar, Vocabulary)
- Filter by JLPT level (N5-N1)
- Lesson cards with status (locked, available, in-progress, completed)
- XP and crown rewards
- Click to start/continue lessons

### Vocabulary Practice (`/practice/vocab`)
- Flashcard interface
- Multiple practice modes (recognition, production, listening)
- Progress tracking (correct/wrong count)
- Session completion with statistics

### Quiz (`/quiz`)
- Multiple question types:
  - Multiple-choice
  - Type answer (Japanese input)
  - Match exercises
  - Listen and select
- Heart system (3 lives)
- Score tracking
- Explanations for answers

### Voice Practice (`/practice/voice`)
- Audio recording interface
- Pronunciation feedback (when backend endpoint available)
- Phrase-by-phrase practice
- Difficulty levels (easy, medium, hard)

### Chat (`/chat`)
- Real-time streaming chat with Yukio AI tutor
- Server-Sent Events (SSE) for streaming responses
- Japanese text extraction and display
- Suggested prompts
- Message history

### Progress (`/progress`)
- Level and XP display
- Streak counter
- Weekly activity chart
- Vocabulary mastery by JLPT level
- Recent achievements

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Next.js 14 | ✅ | ✅ | ✅ | ✅ |
| SSE Streaming | ✅ | ✅ | ✅ | ✅ |
| MediaRecorder | ✅ | ✅ | ✅ | ✅ |
| Audio Playback | ✅ | ✅ | ✅ | ✅ |

## Troubleshooting

### Backend Connection Errors
**Error**: `Failed to fetch` or `Network error`

**Solutions**:
- Ensure backend is running: `python -m agent.api` in the `yukio` directory
- Check backend URL in `.env.local`: `NEXT_PUBLIC_BACKEND_URL=http://localhost:8058`
- Verify backend health: `curl http://localhost:8058/health`

### No Lessons/Vocabulary/Quiz Data
**Error**: Empty lists or "endpoint not yet implemented"

**Solutions**:
- Ensure data has been ingested: Run `python -m ingestion.ingest` in the `yukio` directory
- Check backend logs for RAG generation errors
- Verify LanceDB has data: Check `yukio/yukio_data/lancedb/` directory

### Progress Not Saving
**Error**: Progress resets on page refresh

**Solutions**:
- Check browser console for API errors
- Verify user ID is set in localStorage
- Check backend `/progress/{user_id}` endpoint is working
- Ensure LanceDB `user_progress` table exists

### Chat Not Streaming
**Error**: Chat responses don't appear or hang

**Solutions**:
- Check browser console for SSE connection errors
- Verify backend `/chat/stream` endpoint is working
- Check network tab for SSE events
- Ensure Ollama LLM is running and accessible

## Production Build

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Optimizations
- Code splitting (automatic with Next.js)
- Image optimization
- CSS minification
- Tree shaking
- Static page generation where possible

## Architecture

```
┌─────────────────────────────────┐
│     Next.js Frontend            │
│     (Port 3000)                 │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Pages (App Router)      │  │
│  │  - Dashboard              │  │
│  │  - Lessons                │  │
│  │  - Practice               │  │
│  │  - Quiz                   │  │
│  │  - Chat                   │  │
│  │  - Progress               │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  API Client              │  │
│  │  (src/lib/api.ts)        │  │
│  └───────────┬──────────────┘  │
└──────────────┼──────────────────┘
               │ HTTP/REST + SSE
               │
┌──────────────▼──────────────────┐
│     Yukio Backend API           │
│     (Port 8058)                 │
│                                 │
│  - FastAPI                      │
│  - RAG Agent                    │
│  - LanceDB                      │
│  - Ollama LLM                   │
└─────────────────────────────────┘
```

## Data Flow

1. **User Action** (e.g., "Start Lesson")
2. **Frontend** calls `api.getLessons()`
3. **Backend** uses RAG agent to:
   - Search LanceDB for relevant content
   - Use LLM to structure into lessons
   - Return JSON array
4. **Frontend** displays lessons
5. **User completes lesson**
6. **Frontend** calls `api.recordProgress()`
7. **Backend** saves to LanceDB `user_progress` table
8. **Frontend** updates UI with new progress

---

**Built for modern Japanese language learning** 🎌
