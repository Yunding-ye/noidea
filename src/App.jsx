import { useState } from 'react';

const EXAMPLES = [
  'If you really cared about me, you would do this.',
  'I disagree with your decision, but I respect your choice.',
  'Everyone will leave you if you do not listen to me.'
];

const initialResult = null;

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

        {result && (
          <section className="result-grid">
            <article className="card"><h3>Is manipulative</h3><p>{result.isManipulative ? 'Yes' : 'No'}</p></article>
            <article className="card"><h3>Manipulation types</h3><p>{Array.isArray(result.manipulationTypes) ? result.manipulationTypes.join(', ') : 'N/A'}</p></article>
            <article className="card"><h3>Intensity score</h3><p>{result.intensity ?? 'N/A'}</p></article>
            <article className="card"><h3>Confidence score</h3><p>{result.confidence ?? 'N/A'}</p></article>
            <article className="card full"><h3>Explanation</h3><p>{result.explanation || 'N/A'}</p></article>
            <article className="card full"><h3>Warning signs</h3><ul>{(result.warningSigns || []).map((s) => <li key={s}>{s}</li>)}</ul></article>
            <article className="card full"><h3>Safer rewrite</h3><p>{result.saferRewrite || 'N/A'}</p></article>
            <article className="card full"><h3>Recommended action</h3><p>{result.recommendedAction || 'N/A'}</p></article>
          </section>
        )}
      </section>
    </main>
  );
}
