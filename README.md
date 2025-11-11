# eleQtra — Smart Search with AI Summaries

A fast web search engine with AI-powered summaries powered by **SerpAPI** (search) and **Groq** (AI). Works locally and deploys seamlessly to **Vercel**.

## Features

✨ **Real-time web search** via SerpAPI  
🤖 **AI-powered summaries** using Groq  
📱 **Responsive design** for mobile and desktop  
⚡ **Serverless deployment** on Vercel  
🚀 **Local development** with Express backend  

## Local Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone <your-repo-url>
cd eleQtra
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
SERPAPI_KEY=your_serpapi_key_here
GROQ_API_KEY=your_groq_api_key_here
MODEL=llama-3.1-8b-instant
PORT=3300
```

**Get your API keys:**
- **SerpAPI**: https://serpapi.com (sign up, get free tier)
- **Groq**: https://console.groq.com (sign up, get free API key)

### Running Locally

**Full development setup** (live-server on port 3000 + Express backend on port 3300):

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

**Backend only** (if you already have the frontend served):

```bash
npm run start:node
```

**Frontend only** (live-server):

```bash
npm run start:live-server
```

## Deployment to Vercel

### 1. Install Vercel CLI (if needed)

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

From the project root:

```bash
vercel --prod
```

For a preview deployment (without --prod):

```bash
vercel
```

### 4. Set Environment Variables on Vercel

After your first deployment, add environment variables in the **Vercel Dashboard**:

1. Go to your project → **Settings** → **Environment Variables**
2. Add:
   - `SERPAPI_KEY` = your SerpAPI key (Production + Preview)
   - `GROQ_API_KEY` = your Groq key (Production + Preview)
   - `MODEL` = `llama-3.1-8b-instant` (optional, has a default)

Or use the CLI:

```bash
vercel env add SERPAPI_KEY production
vercel env add GROQ_API_KEY production
```

### 5. Redeploy to Apply Environment Variables

After adding env vars, redeploy:

```bash
vercel --prod
```

## Project Structure

```
eleQtra/
├── index.html          # Frontend (static + script for API calls)
├── index.js            # Express backend for local dev
├── api/
│   ├── search2.js      # Vercel serverless function for search
│   └── gpt.js          # Vercel serverless function for AI chat
├── vercel.json         # Vercel configuration
├── package.json        # Dependencies & scripts
├── .env                # Local environment variables (git-ignored)
└── .gitignore          # Excludes .env and node_modules
```

## How It Works

### Local Development

- Frontend (`index.html`) detects `localhost` and calls your **Express backend** (`index.js`) at `http://localhost:3300`
- API routes: `/search2` and `/gpt`

### Vercel Deployment

- Frontend (`index.html`) detects production domain and calls **serverless functions** at `/api/search2` and `/api/gpt`
- Serverless functions (`api/search2.js`, `api/gpt.js`) mirror the Express backend logic
- Static HTML is served automatically by Vercel

## API Endpoints

### POST `/search2` (or `/api/search2` on Vercel)

**Request:**
```json
{
  "query": "latest AI breakthroughs"
}
```

**Response:**
```json
{
  "searchInfo": [
    {
      "topic": "...",
      "description": "...",
      "articleLink": "...",
      "images": [{ "contentUrl": "..." }]
    }
  ],
  "newsInfo": [...],
  "ai_answer": "AI-generated summary of search results",
  "raw": { "organic_results": [...], "news_results": [...] }
}
```

### POST `/gpt` (or `/api/gpt` on Vercel)

**Request:**
```json
{
  "prompt": "Summarize this: ..."
}
```

**Response:**
```json
{
  "response": "AI response text"
}
```

## Troubleshooting

### "No results found" on search
- Check browser console (F12) for error messages
- Verify `SERPAPI_KEY` is set and valid
- Check server logs (`npm run start:node` output)

### AI summarization not working
- Verify `GROQ_API_KEY` is set
- Check if Groq API is reachable
- The app falls back to a canned response if key is missing

### Vercel deployment shows blank page
- Ensure `index.html` is in the project root
- Check Vercel build logs: `vercel logs <your-url>`
- Verify environment variables are set in Vercel Dashboard

### Port 3300 already in use
- The Express server automatically retries on the next port (3301, 3302, etc.)
- Or change `PORT` in `.env`

## Development Tips

- Use `npm run dev` for full local development (recommended)
- Frontend logs API responses to the browser console (F12 → Console tab)
- Backend logs details to the terminal running `npm run start:node`
- Mock search results are returned when `SERPAPI_KEY` is not set (useful for testing UI)

## License

MIT

## Support

For issues or questions:
1. Check the browser console and server logs
2. Verify API keys are correct and have quota remaining
3. Open an issue on GitHub (if applicable)

---

**Happy searching! 🔍✨**
