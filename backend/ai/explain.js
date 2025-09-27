const axios = require('axios');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:latest';

async function explainCode(code) {
  const payload = {
    model: OLLAMA_MODEL,
    messages: [
      {
        role: 'system',
        content: 'Explain the given code simply in 1–3 sentences. Focus on what it does at a high level.',
      },
      { role: 'user', content: code },
    ],
    stream: false,
  };

  try {
    const res = await axios.post(`${OLLAMA_HOST}/api/chat`, payload, { timeout: 60_000 });
    // Parse common Ollama response shapes
    const data = res.data || {};
    const direct = data?.message?.content;
    const first = Array.isArray(data?.messages) ? data.messages[0]?.content : undefined;
    const text = direct || first || data?.response || JSON.stringify(data);
    return text;
  } catch (err) {
    const detail = err?.response?.data || err.message;
    console.error('Ollama error:', detail);
    return 'Could not explain code';
  }
}

module.exports = { explainCode };
