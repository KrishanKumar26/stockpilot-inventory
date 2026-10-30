import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCards = ({ stats }) => {
  // Default fallback values matching screenshot
  const data = stats || {
    totalInventoryValue: { display: '$1,234,567', trend: '+2.1%', isPositive: true },
    lowStockAlerts: { display: '14 items', trend: '-5.0%', isPositive: false },
    avgTurnoverRate: { display: '4.2/year', trend: '+0.3%', isPositive: true },
    potentialLostRevenue: { display: '$12,500', trend: '+1.5%', isPositive: true }
  };

  return (
    <div className="metrics-grid">
      {/* 1. Total Inventory Value */}
      <div className="metric-card">
        <span className="metric-label">Total Inventory Value</span>
        <span className="metric-value">{data.totalInventoryValue?.display || '$1,234,567'}</span>
        <span className={`metric-trend ${data.totalInventoryValue?.isPositive ? 'positive' : 'negative'}`}>
          <ArrowUpRight size={15} />
          {data.totalInventoryValue?.trend || '+2.1%'}
        </span>
      </div>

      {/* 2. Low Stock Alerts */}
      <div className="metric-card">
        <span className="metric-label">Low Stock Alerts</span>
        <span className="metric-value">{data.lowStockAlerts?.display || '14 items'}</span>
        <span className="metric-trend negative">
          <ArrowDownRight size={15} />
          {data.lowStockAlerts?.trend || '-5.0%'}
        </span>
      </div>

      {/* 3. Avg. Turnover Rate */}
      <div className="metric-card">
        <span className="metric-label">Avg. Turnover Rate</span>
        <span className="metric-value">{data.avgTurnoverRate?.display || '4.2/year'}</span>
        <span className="metric-trend positive">
          <ArrowUpRight size={15} />
          {data.avgTurnoverRate?.trend || '+0.3%'}
        </span>
      </div>

      {/* 4. Potential Lost Revenue */}
      <div className="metric-card">
        <span className="metric-label">Potential Lost Revenue</span>
        <span className="metric-value">{data.potentialLostRevenue?.display || '$12,500'}</span>
        <span className="metric-trend positive">
          <ArrowUpRight size={15} />
          {data.potentialLostRevenue?.trend || '+1.5%'}
        </span>
      </div>
    </div>
  );
};

export default StatCards;
