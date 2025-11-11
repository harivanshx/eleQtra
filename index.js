const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { getJson } = require("serpapi");
const Groq = require("groq-sdk");

const app = express();
app.use(express.json());
app.use(cors());

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.MODEL || "llama3-70b-8192";

const groq = new Groq({ apiKey: GROQ_API_KEY });

// ✅ SerpAPI Google Search
async function serpSearch(query) {
  // If no SERPAPI_KEY provided, return a small mock response for local dev
  if (!SERPAPI_KEY) {
    console.warn('SERPAPI_KEY missing — returning mock search results for development');
    return {
      organic_results: [
        { title: `Sample result for ${query}`, snippet: 'This is a mocked search result used when SERPAPI_KEY is not set.', link: 'https://example.com', thumbnail: '' }
      ],
      news_results: [
        { title: `Sample news for ${query}`, snippet: 'Mocked news item.', link: 'https://example.com/news', thumbnail: '' }
      ]
    };
  }

  try {
    return await getJson({ engine: "google", q: query, api_key: SERPAPI_KEY });
  } catch (err) {
    console.error('Error calling SerpAPI:', err && err.message ? err.message : err);
    // return empty shape so downstream still works
    return { organic_results: [], news_results: [] };
  }
}

// ✅ AI-only call
app.post("/gpt", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not set — returning canned GPT response for development');
      return res.json({ response: 'This is a canned AI response because GROQ_API_KEY is not configured.' });
    }

    const r = await groq.chat.completions.create({ model: MODEL, messages: [{ role: "user", content: prompt }] });
    res.json({ response: r.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: "Groq error" });
  }
});

// ✅ Search + News API
app.post("/search2", async (req, res) => {
  try {
    const { query } = req.body;
    const data = await serpSearch(query);
    // Log raw response for debugging to see which keys SerpAPI returns
    console.log('\n--- SerpAPI raw response for query:', query, '---');
    try { console.log(JSON.stringify(data, null, 2)); } catch (e) { console.log(data); }

    let searchInfo = [];
    let newsInfo = [];

    // 🌐 organic search
    if (data.organic_results) {
      searchInfo = data.organic_results.slice(0, 6).map(x => ({
        topic: x.title,
        description: x.snippet,
        articleLink: x.link,
        images: [{ contentUrl: x.thumbnail }],
      }));
    }

    // 📰 news block
    if (data.news_results) {
      newsInfo = data.news_results.slice(0, 6).map(x => ({
        topic: x.title,
        description: x.snippet,
        articleLink: x.link,
        images: [{ contentUrl: x.thumbnail }],
      }));
    }

    // Ask AI if GROQ is configured, otherwise return a canned message
    let ai_answer = null;
    if (!GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not set — skipping AI summarization');
      ai_answer = 'AI summarization is disabled because GROQ_API_KEY is not configured.';
    } else {
      try {
        const ai = await groq.chat.completions.create({
          model: MODEL,
          messages: [
            { role: "system", content: `Summarize search and news results for: ${query}` },
            { role: "system", content: JSON.stringify({ searchInfo, newsInfo }) }
          ],
        });
        ai_answer = ai.choices[0].message.content;
      } catch (e) {
        console.error('AI summarization failed:', e && e.message ? e.message : e);
        ai_answer = 'AI summarization failed';
      }
    }

    res.json({ searchInfo, newsInfo, ai_answer, raw: data });

  } catch (err) {
    res.status(500).json({ error: "Search API failed" });
  }
});

// Start server on provided PORT or 3300; if port is in use, try the next port.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3300;
function startServer(port) {
  const server = app.listen(port, () => console.log(`✅ Backend running on ${port}`));
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

startServer(DEFAULT_PORT);
