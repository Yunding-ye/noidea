import { useMemo, useState } from 'react';

const EXAMPLES = [
  'If you really cared about me, you would do this.',
  'I disagree with your decision, but I respect your choice.',
  'Everyone will leave you if you do not listen to me.'
];

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const normalized = useMemo(() => {
    if (!result) return null;

    const dangerScore = Math.max(0, Math.min(100, Number(result.dangerScore) || 0));
    const confidence = Math.max(0, Math.min(100, Number(result.confidence) || 0));
    const manipulationTypes = Array.isArray(result.manipulationTypes)
      ? result.manipulationTypes
      : [];
    const specificEvidence = Array.isArray(result.specificEvidence)
      ? result.specificEvidence
      : [];

    return {
      classification: result.classification || 'Unknown',
      dangerLevel: result.dangerLevel || 'Unknown',
      dangerScore,
      confidence,
      manipulationTypes,
      evidenceAnalysis: result.evidenceAnalysis || 'No analysis available.',
      specificEvidence,
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
          <p>
            Analyze emotional pressure, coercive patterns, and manipulative language signals.
          </p>
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
                onClick={() => {
                  setText(example);
                  setResult(null);
                  setError('');
                }}
              >
                {example}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="analyze-btn"
            onClick={analyzeText}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>

          {error && <p className="error">{error}</p>}
        </section>

        {normalized && (
          <section className="results-section">
            <article className="card summary-card">
              <h2>Analysis Summary</h2>

              <div className="summary-grid">
                <div>
                  <span>Classification</span>
                  <strong>{normalized.classification}</strong>
                </div>
                <div>
                  <span>Danger Level</span>
                  <strong>{normalized.dangerLevel}</strong>
                </div>
                <div>
                  <span>Danger Score</span>
                  <strong>{normalized.dangerScore}/100</strong>
                </div>
                <div>
                  <span>Confidence</span>
                  <strong>{normalized.confidence}%</strong>
                </div>
              </div>

              <div className="score-wrap">
                <div className="score-label">
                  <span>Danger Score</span>
                  <span>{normalized.dangerScore}</span>
                </div>
                <div
                  className="score-track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={normalized.dangerScore}
                >
                  <div
                    className="score-fill"
                    style={{ width: `${normalized.dangerScore}%` }}
                  />
                </div>
              </div>
            </article>

            <article className="card">
              <h3>Manipulation Types</h3>
              <div className="chip-row">
                {normalized.manipulationTypes.length ? (
                  normalized.manipulationTypes.map((type) => (
                    <span className="chip" key={type}>
                      {type}
                    </span>
                  ))
                ) : (
                  <span className="muted">No manipulation types detected.</span>
                )}
              </div>
            </article>

            <article className="card full">
              <h3>Evidence-Based Analysis</h3>
              <p>{normalized.evidenceAnalysis}</p>
            </article>

            <section className="full">
              <h3 className="section-title">Specific Evidence</h3>
              <div className="evidence-grid">
                {normalized.specificEvidence.length ? (
                  normalized.specificEvidence.map((item, index) => (
                    <article
                      className="card evidence-card"
                      key={`${item.quote || 'evidence'}-${index}`}
                    >
                      <p className="evidence-quote">
                        “{item.quote || 'No quote provided.'}”
                      </p>
                      <p>
                        <strong>Pattern:</strong> {item.pattern || 'Not specified'}
                      </p>
                      <p>
                        <strong>Explanation:</strong>{' '}
                        {item.explanation || 'Not specified'}
                      </p>
                    </article>
                  ))
                ) : (
                  <article className="card evidence-card">
                    <p className="muted">No specific evidence snippets provided.</p>
                  </article>
                )}
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
