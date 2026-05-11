import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You analyze language patterns for signs of manipulation. Analyze only the provided text. Do not diagnose the speaker. Do not claim certainty about intent. Identify linguistic signals such as guilt-tripping, gaslighting, emotional blackmail, coercion, threat, blame-shifting, love bombing, victim-playing, false dilemma, isolation, or none. Return strict JSON only. If the text is not manipulative, return isManipulative false, manipulationTypes ["none"], low intensity, and a neutral explanation.`;

app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body ?? {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please provide text to analyze.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: missing API key.' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze the following text and return JSON with this exact schema:\n\n{\n  "isManipulative": boolean,\n  "manipulationTypes": string[],\n  "intensity": number,\n  "confidence": number,\n  "explanation": string,\n  "warningSigns": string[],\n  "saferRewrite": string,\n  "recommendedAction": string\n}\n\nText:\n"""${text.trim()}"""`
        }
      ],
      temperature: 0.2
    });

    const raw = response.choices?.[0]?.message?.content;

    if (!raw) {
      return res.status(502).json({ error: 'No analysis returned from AI service.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: 'Invalid analysis format returned by AI service.' });
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Analysis error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to analyze text. Please try again.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
