import React, { useState } from 'react';
import { DollarSign, Clock, TrendingUp, Sparkles } from 'lucide-react';

const ROICalculator = () => {
  const [monthlySpend, setMonthlySpend] = useState(150000);
  const [stockoutDays, setStockoutDays] = useState(4);

  // Formulas
  const annualSpend = monthlySpend * 12;
  const lostRevenuePerYear = Math.round((monthlySpend * 0.08) * (stockoutDays * 1.5) * 1.2);
  const laborHoursSaved = Math.round(stockoutDays * 18 * 12);
  const estimatedSavings = Math.round(lostRevenuePerYear * 0.85);

  return (
    <div className="roi-calculator-container">
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div className="section-pill" style={{ color: '#10b981' }}>ROI IMPACT SIMULATOR</div>
        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
          Calculate Your Annual Inventory Savings with ShopAI
        </h3>
        <p style={{ fontSize: '14px', color: '#8e9bb2' }}>
          Adjust the sliders to simulate revenue recovery from prevented stockouts and automated PO labor.
        </p>
      </div>

      <div className="roi-grid">
        {/* Left: Interactive Controls */}
        <div className="roi-controls">
          <div className="roi-slider-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                Monthly Inventory Valuation
              </label>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>
                ${Number(monthlySpend).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="1000000"
              step="10000"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(Number(e.target.value))}
              className="roi-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              <span>$20k</span>
              <span>$500k</span>
              <span>$1M+</span>
            </div>
          </div>

          <div className="roi-slider-group" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                Monthly Stockout Occurrences
              </label>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#f87171' }}>
                {stockoutDays} incident(s) / month
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={stockoutDays}
              onChange={(e) => setStockoutDays(Number(e.target.value))}
              className="roi-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              <span>1 incident</span>
              <span>7 incidents</span>
              <span>15 incidents</span>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Calculated Outcomes */}
        <div className="roi-results">
          <div className="roi-stat-card highlighted">
            <span style={{ fontSize: '12px', color: '#93c5fd', fontWeight: 600 }}>
              ESTIMATED ANNUAL CAPITAL SAVINGS
            </span>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
              ${estimatedSavings.toLocaleString()}
            </div>
            <span style={{ fontSize: '11.5px', color: '#34d399', fontWeight: 600 }}>
              ↑ Recovered from avoided stockouts & dead inventory
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="roi-mini-card">
              <span style={{ fontSize: '11px', color: '#64748b' }}>Hours Saved/Yr</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8' }}>
                {laborHoursSaved} hrs
              </span>
              <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Manual PO automation</span>
            </div>

            <div className="roi-mini-card">
              <span style={{ fontSize: '11px', color: '#64748b' }}>Stock Accuracy</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
                99.8%
              </span>
              <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Dual DB verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
