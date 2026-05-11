import { useMemo, useState } from 'react';

const EXAMPLES = [
  'If you really cared about me, you would do this.',
  'I disagree with your decision, but I respect your choice.',
  'Everyone will leave you if you do not listen to me.'
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeDangerScore = (rawScore, rawLevel) => {
  let score = Number(rawScore);
  if (!Number.isFinite(score)) score = 0;
  if (score <= 1) score *= 100;
  score = clamp(score, 0, 100);

  const level = String(rawLevel || '').toLowerCase();

  if (level === 'high' && score < 51) score = 70;
  if (level === 'severe' && score < 81) score = 90;
  if (level === 'moderate') score = clamp(score, 21, 50);
  if (level === 'low') score = clamp(score, 0, 20);

  return Math.round(score);
};

const normalizeConfidence = (rawConfidence) => {
  let confidence = Number(rawConfidence);
  if (!Number.isFinite(confidence)) confidence = 0;
  if (confidence <= 1) confidence *= 100;
  confidence = clamp(confidence, 0, 100);
  return Math.round(confidence);
};

const normalizeManipulationTypes = (value) => {
  if (Array.isArray(value) && value.length) return value;
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return ['none'];
};

const normalizeEvidence = (value) => {
  if (!Array.isArray(value)) return [];

  return value.map((item) => ({
    quote: item?.quote?.trim?.() || 'No direct quote provided.',
    pattern: item?.pattern?.trim?.() || 'Unspecified pattern.',
    explanation: item?.explanation?.trim?.() || 'No explanation provided.'
  }));
};

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const normalized = useMemo(() => {
    if (!result) return null;

    const dangerLevel = result.dangerLevel || 'Unknown';

    return {
      classification: result.classification || 'Unknown',
      dangerLevel,
      dangerScore: normalizeDangerScore(result.dangerScore, dangerLevel),
      confidence: normalizeConfidence(result.confidence),
      manipulationTypes: normalizeManipulationTypes(result.manipulationTypes),
      evidenceAnalysis: result.evidenceAnalysis || 'No analysis available.',
      specificEvidence: normalizeEvidence(result.specificEvidence),
      relationshipAdvice: result.relationshipAdvice || 'No advice available.',
      recommendedResponse: result.recommendedResponse || 'No response suggestion available.',
      saferRewrite: result.saferRewrite || 'No healthier rewrite available.'
    };
  }, [result]);

  const analyzeText = async () => {
    setError('');

    if (!text.trim()) {
      setResult(null);
      setError('Please enter a message before analyzing.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong while analyzing.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to analyze right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <section className="container">
        <header className="header">
          <h1>Manipulative Language Checker</h1>
          <p>Analyze emotional pressure, coercive patterns, and manipulative language signals.</p>
        </header>

        <section className="input-panel card">
          <label htmlFor="message">Message to analyze</label>
          <textarea
            id="message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type a message here..."
            rows={8}
          />

          <div className="example-buttons">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="example-btn"
                onClick={() => setText(example)}
              >
                {example}
              </button>
            ))}
          </div>

          <button type="button" className="analyze-btn" onClick={analyzeText} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>

          {error && <p className="error">{error}</p>}
        </section>

        {normalized && (
          <section className="results-section">
            <article className="card summary-card">
              <h2>Analysis Summary</h2>
              <div className="summary-grid">
                <div><span>Classification</span><strong>{normalized.classification}</strong></div>
                <div><span>Danger Level</span><strong>{normalized.dangerLevel}</strong></div>
                <div><span>Danger Score</span><strong>{normalized.dangerScore}/100</strong></div>
                <div><span>Confidence</span><strong>{normalized.confidence}%</strong></div>
              </div>
              <div className="score-wrap">
                <div className="score-label"><span>Danger Score</span><span>{normalized.dangerScore}</span></div>
                <div className="score-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalized.dangerScore}>
                  <div className="score-fill" style={{ width: `${normalized.dangerScore}%` }} />
                </div>
              </div>
            </article>

            <article className="card">
              <h3>Manipulation Types</h3>
              <div className="chip-row">
                {normalized.manipulationTypes.map((type, index) => <span className="chip" key={`${type}-${index}`}>{type}</span>)}
              </div>
            </article>

            <article className="card full">
              <h3>Evidence-Based Analysis</h3>
              <p>{normalized.evidenceAnalysis}</p>
            </article>

            <section className="full">
              <h3 className="section-title">Specific Evidence</h3>
              <div className="evidence-grid">
                {normalized.specificEvidence.length ? normalized.specificEvidence.map((item, index) => (
                  <article className="card evidence-card" key={`${item.quote}-${index}`}>
                    <p className="evidence-quote">“{item.quote}”</p>
                    <p><strong>Pattern:</strong> {item.pattern}</p>
                    <p><strong>Explanation:</strong> {item.explanation}</p>
                  </article>
                )) : <article className="card evidence-card"><p className="muted">No specific evidence snippets provided.</p></article>}
              </div>
            </section>

            <article className="card full">
              <h3>Relationship Advice</h3>
              <p>{normalized.relationshipAdvice}</p>
            </article>

            <article className="card full">
              <h3>Suggested Response</h3>
              <p>{normalized.recommendedResponse}</p>
            </article>

            <article className="card full">
              <h3>Healthier Rewrite</h3>
              <p>{normalized.saferRewrite}</p>
            </article>
          </section>
        )}
      </section>
    </main>
  );
}
