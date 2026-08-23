const fetch = global.fetch || require('node-fetch');

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_API_URL = 'https://api.anthropic.com/v1/messages';

async function callLLM(prompt) {
  if (!LLM_API_KEY || LLM_API_KEY === 'leave-blank-for-now') {
    throw new Error('LLM_API_KEY not configured');
  }

  const response = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LLM_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content.find(block => block.type === 'text');
  return textBlock ? textBlock.text : '';
}

// Pre-visit: urgency, chief complaint, 3 suggested questions
exports.generatePreVisitSummary = async (symptoms) => {
  const prompt = `Analyse these symptoms and return ONLY valid JSON with this exact shape: {"urgency_level": "Low" | "Medium" | "High", "chief_complaint": "string", "suggested_questions": ["q1", "q2", "q3"]}. No preamble, no markdown fences, just the JSON object. Symptoms: ${symptoms}`;

  try {
    const raw = await callLLM(prompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Pre-visit LLM summary failed:', err.message);
    return {
      urgency_level: 'Unknown',
      chief_complaint: 'AI summary unavailable — please review symptoms manually',
      suggested_questions: [],
      error: true
    };
  }
};

// Post-visit: patient-friendly summary with medication schedule and follow-up
exports.generatePostVisitSummary = async (notes) => {
  const prompt = `Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: ${notes}`;

  try {
    return await callLLM(prompt);
  } catch (err) {
    console.error('Post-visit LLM summary failed:', err.message);
    return 'Your post-visit summary could not be generated automatically. Please contact the clinic for a summary of your visit and prescription details.';
  }
};