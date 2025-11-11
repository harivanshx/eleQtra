const Groq = require('groq-sdk');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.MODEL || 'llama3-70b-8192';

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing `prompt` in request body' });

    if (!GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not set — returning canned GPT response for development (serverless)');
      return res.json({ response: 'This is a canned AI response because GROQ_API_KEY is not configured.' });
    }

    try {
      const r = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
      });
      return res.json({ response: r.choices[0].message.content });
    } catch (e) {
      console.error('Groq API call failed:', e && e.message ? e.message : e);
      return res.status(500).json({ error: 'Groq error' });
    }
  } catch (err) {
    console.error('gpt function error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
