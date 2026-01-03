# Yukio Frontend Setup Instructions

Complete setup guide for the Yukio frontend application.

## Prerequisites

- **Node.js 18+** and npm
- **Yukio Backend** running on `http://localhost:8058`
- **Ollama** running with required models:
  - `qwen2.5:14b-instruct`
  - `nomic-embed-text`

## Step 1: Install Dependencies

```bash
cd yukio-frontend
npm install
```

## Step 2: Configure Environment

Create `.env.local` file in the `yukio-frontend` directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8058
```

This tells the frontend where to find the Yukio backend API.

## Step 3: Verify Backend is Running

Before starting the frontend, ensure the backend is running:

```bash
# In the yukio directory
cd ../yukio
source .venv/bin/activate
python -m agent.api
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8058
```

Test the health endpoint:
```bash
curl http://localhost:8058/health
```

## Step 4: Start Development Server

```bash
# In the yukio-frontend directory
npm run dev
```

The frontend will be available at http://localhost:3000

## Step 5: Verify Data Ingestion

The frontend requires ingested data to display lessons, vocabulary, and quizzes. If you see empty lists:

1. **Check if data is ingested**:
   ```bash
   # In the yukio directory
   python -c "from agent.db_utils import db_manager; db_manager.initialize(); print('Tables:', db_manager.db.list_tables())"
   ```

2. **If no data, run ingestion**:
   ```bash
   python -m ingestion.ingest --verbose
   ```

## Troubleshooting

### Frontend won't start
- Check Node.js version: `node --version` (should be 18+)
- Delete `node_modules` and `.next`, then `npm install` again

### Backend connection errors
- Verify backend is running on port 8058
- Check `.env.local` has correct `NEXT_PUBLIC_BACKEND_URL`
- Check browser console for CORS errors (backend should handle CORS)

### No data showing
- Ensure data ingestion completed successfully
- Check backend logs for RAG generation errors
- Verify LanceDB has data in `yukio/yukio_data/lancedb/`

### TypeScript errors
- Run `npm run type-check` to see all type errors
- Ensure all dependencies are installed: `npm install`

## Next Steps

Once setup is complete:
1. Visit http://localhost:3000
2. Start with the Dashboard to see your progress
3. Browse Lessons to see dynamically generated content
4. Try the Chat interface to interact with Yukio AI tutor
5. Practice vocabulary and take quizzes

All features use real backend API endpoints - no mock data!
