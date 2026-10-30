import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import StatCards from '../components/StatCards';

const DashboardPage = ({ stats, chartData, products }) => {
  const salesTrends = chartData?.salesTrends || [
    { month: 'Jan', sales: 42000, inventoryVal: 1120000 },
    { month: 'Feb', sales: 49000, inventoryVal: 1150000 },
    { month: 'Mar', sales: 58000, inventoryVal: 1180000 },
    { month: 'Apr', sales: 63000, inventoryVal: 1205000 },
    { month: 'May', sales: 71000, inventoryVal: 1210000 },
    { month: 'Jun', sales: 85000, inventoryVal: 1234567 }
  ];

  const categoryData = chartData?.categories || [
    { category: 'Wellness', count: 4, total_units: 82 },
    { category: 'Beverages', count: 3, total_units: 116 },
    { category: 'Eco Essentials', count: 2, total_units: 45 },
    { category: 'Home & Kitchen', count: 2, total_units: 51 }
  ];

  const lowStockItems = products.filter(
    (p) => p.status === 'Low Stock' || p.status === 'Out of Stock' || p.status === 'Warning'
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Executive Dashboard</h1>
      </div>

      {/* Top Metrics Cards */}
      <StatCards stats={stats} />

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Sales & Inventory Trend Area Chart */}
        <div className="widget-card">
          <h3 className="widget-title">Sales Revenue vs Inventory Valuation</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={salesTrends}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stop-color="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c263c" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1523', borderColor: '#1c263c', borderRadius: '8px' }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Amount']}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#salesGrad)" name="Sales Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="widget-card">
          <h3 className="widget-title">Stock Units by Category</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c263c" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1523', borderColor: '#1c263c', borderRadius: '8px' }}
                />
                <Bar dataKey="total_units" fill="#10b981" radius={[4, 4, 0, 0]} name="Units in Stock" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Stock Alerts Table */}
      <div className="table-panel">
        <h3 className="widget-title" style={{ marginBottom: 4 }}>Urgent Stock Alerts</h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          Items below their designated safety thresholds requiring reorders.
        </p>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Units Left</th>
              <th>Threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="product-cell">
                    <img src={p.image_url} alt={p.name} className="product-thumb" />
                    <span className="product-name">{p.name}</span>
                  </div>
                </td>
                <td><span className="sku-text">{p.sku}</span></td>
                <td><span className="available-units">{p.available_stock} units</span></td>
                <td><span style={{ color: '#64748b' }}>{p.min_stock_threshold} units</span></td>
                <td>
                  <span className={`status-badge ${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    <span className="status-dot"></span>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
