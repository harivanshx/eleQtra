const { getJson } = require('serpapi');
const Groq = require('groq-sdk');

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.MODEL || 'llama3-70b-8192';

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// helper: simple CORS for serverless functions
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function serpSearch(query) {
  if (!SERPAPI_KEY) {
    console.warn('SERPAPI_KEY missing — returning mock search results for development (serverless)');
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
    return await getJson({ engine: 'google', q: query, api_key: SERPAPI_KEY });
  } catch (err) {
    console.error('Error calling SerpAPI:', err && err.message ? err.message : err);
    return { organic_results: [], news_results: [] };
  }
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { query } = req.body || {};
    if (!query) return res.status(400).json({ error: 'Missing `query` in request body' });

    const data = await serpSearch(query);
    console.log('\n--- SerpAPI raw response for query:', query, '---');
    try { console.log(JSON.stringify(data, null, 2)); } catch (e) { console.log(data); }

    let searchInfo = [];
    let newsInfo = [];

    if (Array.isArray(data.organic_results)) {
      searchInfo = data.organic_results.slice(0, 6).map(x => ({
        topic: x.title,
        description: x.snippet || x.description || '',
        articleLink: x.link || x.url,
        images: [{ contentUrl: x.thumbnail }],
      }));
    }

    if (Array.isArray(data.news_results)) {
      newsInfo = data.news_results.slice(0, 6).map(x => ({
        topic: x.title,
        description: x.snippet || x.description || '',
        articleLink: x.link || x.url,
        images: [{ contentUrl: x.thumbnail }],
      }));
    }

    // Ask AI summarization if available
    let ai_answer = null;
    if (!GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not set — skipping AI summarization (serverless)');
      ai_answer = 'AI summarization is disabled because GROQ_API_KEY is not configured.';
    } else {
      try {
        const ai = await groq.chat.completions.create({
          model: MODEL,
          messages: [
            { role: 'system', content: `Summarize search and news results for: ${query}` },
            { role: 'system', content: JSON.stringify({ searchInfo, newsInfo }) },
          ],
        });
        ai_answer = ai.choices[0].message.content;
      } catch (e) {
        console.error('AI summarization failed:', e && e.message ? e.message : e);
        ai_answer = 'AI summarization failed';
      }
    }

    return res.json({ searchInfo, newsInfo, ai_answer, raw: data });
  } catch (err) {
    console.error('search2 error:', err);
    res.status(500).json({ error: 'Search API failed' });
  }
};
