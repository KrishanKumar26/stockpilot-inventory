import React, { useState, useEffect } from 'react';
import { Sparkles, Send, ArrowRight, ShieldAlert, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const AICopilotWidget = ({ onTriggerAction }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);

  const samplePrompts = [
    'Check critical stockout risks',
    'Forecast 14-day demand surge',
    'Audit inventory capital valuation',
    'Recommend supplier replenishment orders'
  ];

  const handleAskAI = async (promptText) => {
    const textToAsk = promptText || query;
    if (!textToAsk.trim()) return;

    setLoading(true);
    try {
      const res = await api.askAICopilot(textToAsk);
      if (res.success) {
        setAiData(res.data);
      }
    } catch (err) {
      console.error('AI query error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount for immediate intelligence display
    handleAskAI('Check critical stockout risks');
  }, []);

  return (
    <div className="ai-copilot-container">
      {/* Header Bar */}
      <div className="ai-copilot-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="ai-pulse-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
                ShopAI Neural Copilot
              </h3>
              <span className="ai-live-badge">Live PostgreSQL Analysis</span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              Autonomous telemetry analyzing safety stock, stockout probability & supply chains.
            </p>
          </div>
        </div>

        {aiData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Confidence: <strong style={{ color: '#38bdf8' }}>{aiData.confidenceScore}</strong>
            </span>
            <span className={`status-badge ${aiData.riskLevel === 'High' ? 'low-stock' : 'warning'}`}>
              <span className="status-dot"></span>
              {aiData.riskLevel} Risk
            </span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="ai-prompt-chips">
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Try queries:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            className="ai-chip-btn"
            onClick={() => {
              setQuery(p);
              handleAskAI(p);
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAskAI(query);
        }}
        className="ai-input-form"
      >
        <input
          type="text"
          className="ai-text-input"
          placeholder="Ask AI anything (e.g., 'Predict stockout timeline for beverages' or 'Which PO should we expedite?')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-primary" style={{ padding: '8px 18px' }} disabled={loading}>
          {loading ? <RefreshCw size={15} className="spin-icon" /> : <Send size={15} />}
          <span>{loading ? 'Analyzing...' : 'Ask AI'}</span>
        </button>
      </form>

      {/* AI Response Card */}
      {aiData && (
        <div className="ai-response-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '14.5px', color: '#38bdf8', fontWeight: 700, margin: 0 }}>
              {aiData.title}
            </h4>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Updated seconds ago</span>
          </div>

          <p style={{ fontSize: '13.5px', color: '#f1f5f9', lineHeight: '1.6', marginBottom: '14px' }}>
            {aiData.summary}
          </p>

          {/* Key Insights List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {aiData.insights?.map((insight, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#94a3b8' }}>
                <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{insight}</span>
              </div>
            ))}
          </div>

          {/* Recommended Actions */}
          {aiData.recommendedActions && aiData.recommendedActions.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
                Recommended Autonomous Interventions:
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {aiData.recommendedActions.map((rec, rIdx) => (
                  <div
                    key={rIdx}
                    style={{
                      backgroundColor: '#0c1322',
                      border: '1px solid #1e2c45',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: rec.priority === 'Urgent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: rec.priority === 'Urgent' ? '#f87171' : '#60a5fa'
                      }}
                    >
                      {rec.priority}
                    </span>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#fff', display: 'block' }}>{rec.action}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{rec.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AICopilotWidget;
