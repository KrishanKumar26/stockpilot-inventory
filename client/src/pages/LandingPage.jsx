import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Layers,
  TrendingUp,
  Database,
  ArrowRight,
  CheckCircle,
  Bell,
  Box,
  Truck,
  Cpu,
  Lock,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import AICopilotWidget from '../components/AICopilotWidget';
import ROICalculator from '../components/ROICalculator';

const LandingPage = ({ onLaunchApp, onOpenAuth, isAuthenticated, user, onOpenAdmin }) => {
  const [previewTab, setPreviewTab] = useState('catalog'); // 'catalog' | 'reorder' | 'pipeline'
  return (
    <div className="landing-page">
      {/* 1. Header Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="brand-section" style={{ marginBottom: 0, paddingLeft: 0, cursor: 'pointer' }} onClick={onLaunchApp}>
            <div className="brand-logo">
              <span>AI</span>
            </div>
            <div className="brand-info">
              <h2>ShopAI</h2>
              <p>Intelligent Commerce</p>
            </div>
          </div>

          <nav className="landing-menu">
            <a href="#features">Features</a>
            <a href="#architecture">Architecture</a>
            <a href="#demo">Live Demo</a>
            <a href="#pricing">Pricing</a>
            {user?.role === 'admin' && (
              <button
                className="admin-badge-nav"
                onClick={onOpenAdmin}
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#c084fc',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ⚡ Admin Panel
              </button>
            )}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Hi, <strong>{user?.name?.split(' ')[0]}</strong>
                </span>
                <button className="btn-primary" onClick={onLaunchApp}>
                  Go to Dashboard <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <>
                <button className="btn-secondary" onClick={() => onOpenAuth('login')}>
                  Sign In
                </button>
                <button className="btn-primary" onClick={() => onOpenAuth('register')}>
                  Get Started <ChevronRight size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Zap size={14} style={{ color: '#3b82f6' }} />
          <span>Next-Gen Autonomous Commerce • AI Reorder Engine 2.0</span>
        </div>

        <h1 className="hero-title">
          Intelligent Inventory & <br />
          <span className="hero-gradient">Automated Supply Chain</span> Management
        </h1>

        <p className="hero-subtitle">
          Predict stockouts before they happen, dispatch automated supplier purchase orders, and sync PostgreSQL ACID transactions with MongoDB audit logging in real-time.
        </p>

        <div className="hero-cta-group">
          <button className="btn-hero-primary" onClick={onLaunchApp}>
            Launch Live Inventory App
            <ArrowRight size={18} />
          </button>
          <a href="#architecture" className="btn-hero-secondary">
            Explore System Architecture
          </a>
        </div>

        {/* Live Metrics Row */}
        <div className="hero-stats-row">
          <div className="hero-stat-item">
            <span className="stat-number">$1,234,567</span>
            <span className="stat-label">Active Inventory Valuation</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-item">
            <span className="stat-number">99.8%</span>
            <span className="stat-label">Automated Reorder Accuracy</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-item">
            <span className="stat-number">4.2 / yr</span>
            <span className="stat-label">Average Turnover Velocity</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-item">
            <span className="stat-number">0%</span>
            <span className="stat-label">Unmonitored Stockouts</span>
          </div>
        </div>

        {/* Interactive Dashboard Preview Card with Tabs */}
        <div id="demo" className="hero-preview-container">
          <div className="preview-header">
            <div className="preview-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            
            {/* Interactive Preview Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className={`preview-tab-btn ${previewTab === 'catalog' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setPreviewTab('catalog'); }}
              >
                Stock Catalog
              </button>
              <button
                type="button"
                className={`preview-tab-btn ${previewTab === 'reorder' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setPreviewTab('reorder'); }}
              >
                AI Reorder Queue
              </button>
              <button
                type="button"
                className={`preview-tab-btn ${previewTab === 'pipeline' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setPreviewTab('pipeline'); }}
              >
                PO Pipeline
              </button>
            </div>

            <button
              className="btn-primary"
              style={{ fontSize: '11px', padding: '4px 10px', height: 'auto' }}
              onClick={onLaunchApp}
            >
              Open Full App →
            </button>
          </div>

          <div className="preview-body" onClick={onLaunchApp}>
            {/* Embedded Live Snapshot of UI matching the screenshot */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div className="preview-metric">
                <span className="p-label">Total Inventory Value</span>
                <span className="p-value">$1,234,567</span>
                <span className="p-trend green">↑ +2.1%</span>
              </div>
              <div className="preview-metric">
                <span className="p-label">Low Stock Alerts</span>
                <span className="p-value">14 items</span>
                <span className="p-trend red">↓ -5.0%</span>
              </div>
              <div className="preview-metric">
                <span className="p-label">Avg. Turnover Rate</span>
                <span className="p-value">4.2/year</span>
                <span className="p-trend green">↑ +0.3%</span>
              </div>
              <div className="preview-metric">
                <span className="p-label">Potential Lost Revenue</span>
                <span className="p-value">$12,500</span>
                <span className="p-trend green">↑ +1.5%</span>
              </div>
            </div>

            {previewTab === 'catalog' && (
              <div className="preview-table-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>Active Stock Catalog (PostgreSQL)</span>
                  <span style={{ fontSize: '12px', color: '#38bdf8' }}>Click to manage inventory →</span>
                </div>
                <div className="preview-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/products/coconut-oil.svg" width="24" height="24" alt="" />
                    <span>Organic Coconut Oil</span>
                  </div>
                  <span className="sku-text" style={{ fontSize: '12px' }}>SKU-84521</span>
                  <span>8 units</span>
                  <span className="status-badge low-stock" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    <span className="status-dot"></span> Low Stock
                  </span>
                </div>
                <div className="preview-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/products/coffee-beans.svg" width="24" height="24" alt="" />
                    <span>Artisanal Coffee Beans</span>
                  </div>
                  <span className="sku-text" style={{ fontSize: '12px' }}>SKU-78932</span>
                  <span>52 units</span>
                  <span className="status-badge in-stock" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    <span className="status-dot"></span> In Stock
                  </span>
                </div>
                <div className="preview-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/products/toothbrushes.svg" width="24" height="24" alt="" />
                    <span>Bamboo Toothbrushes</span>
                  </div>
                  <span className="sku-text" style={{ fontSize: '12px' }}>SKU-11245</span>
                  <span>0 units</span>
                  <span className="status-badge out-of-stock" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    <span className="status-dot"></span> Out of Stock
                  </span>
                </div>
              </div>
            )}

            {previewTab === 'reorder' && (
              <div className="preview-table-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>AI Reorder Recommendations</span>
                  <span style={{ fontSize: '12px', color: '#10b981' }}>Autonomous Safety Restock</span>
                </div>
                <div className="preview-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/products/coconut-oil.svg" width="24" height="24" alt="" />
                    <div>
                      <strong style={{ fontSize: '12.5px', color: '#fff' }}>Organic Coconut Oil</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>8 units left</span>
                    </div>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: 600, fontSize: '12px' }}>Reorder 50 units</span>
                  <button className="btn-reorder" style={{ padding: '4px 10px', fontSize: '11px' }}>Reorder</button>
                </div>
                <div className="preview-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/products/toothbrushes.svg" width="24" height="24" alt="" />
                    <div>
                      <strong style={{ fontSize: '12.5px', color: '#fff' }}>Bamboo Toothbrushes</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>0 units left</span>
                    </div>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: 600, fontSize: '12px' }}>Reorder 100 units</span>
                  <button className="btn-reorder" style={{ padding: '4px 10px', fontSize: '11px' }}>Reorder</button>
                </div>
              </div>
            )}

            {previewTab === 'pipeline' && (
              <div className="preview-table-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>Automated Reorder Pipeline (Live PO Tracking)</span>
                  <span style={{ fontSize: '12px', color: '#38bdf8' }}>3 In-Flight Shipments</span>
                </div>
                <div className="preview-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="pipeline-icon-box sent" style={{ width: '26px', height: '26px' }}>📄</div>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#fff' }}>PO #78912 Sent</strong>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#64748b' }}>Supplier: EcoGoods Inc. • Qty: 50</span>
                    </div>
                  </div>
                  <span style={{ color: '#60a5fa', fontSize: '11.5px' }}>ETA: 5 days</span>
                </div>
                <div className="preview-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="pipeline-icon-box transit" style={{ width: '26px', height: '26px' }}>🚚</div>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#fff' }}>PO #78905 In Transit</strong>
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#64748b' }}>Supplier: Pacific Traders • Qty: 100</span>
                    </div>
                  </div>
                  <span style={{ color: '#c084fc', fontSize: '11.5px' }}>ETA: 3 days</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Interactive AI Copilot Section on Homepage */}
        <div style={{ width: '100%', maxWidth: '1060px', marginTop: '48px', textAlign: 'left' }}>
          <AICopilotWidget />
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-pill">Why ShopAI</span>
          <h2 className="section-title">Engineered for High-Velocity Modern Commerce</h2>
          <p className="section-desc">
            Traditional inventory spreadsheets fail when scale increases. ShopAI combines automated machine intelligence with dual-engine relational and document persistence.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6' }}>
              <Cpu size={24} />
            </div>
            <h3 className="feature-heading">Autonomous AI Reorder Engine</h3>
            <p className="feature-text">
              Monitors dynamic sell-through velocity and minimum safety thresholds. Automatically drafts supplier Purchase Orders with zero human latency.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Database size={24} />
            </div>
            <h3 className="feature-heading">PostgreSQL ACID Transactions</h3>
            <p className="feature-text">
              Stock deductions upon checkout use atomic row-level locks (<code>SELECT FOR UPDATE</code>) to guarantee zero stock overselling under heavy concurrency.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Bell size={24} />
            </div>
            <h3 className="feature-heading">Dynamic Stock Warning Signals</h3>
            <p className="feature-text">
              Real-time classification tags products into In Stock, Warning, Low Stock, or Out of Stock, triggering immediate procurement alerts.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <Layers size={24} />
            </div>
            <h3 className="feature-heading">MongoDB Audit & Activity Streams</h3>
            <p className="feature-text">
              Every creation, modification, authentication event, and PO progression is immutably logged into MongoDB for security and regulatory compliance.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
              <TrendingUp size={24} />
            </div>
            <h3 className="feature-heading">Turnover & Lost Revenue Analytics</h3>
            <p className="feature-text">
              Visualize stock velocity, top selling categories, and identify potential lost revenue caused by out-of-stock items using Recharts.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
              <Lock size={24} />
            </div>
            <h3 className="feature-heading">Enterprise RBAC & OTP Security</h3>
            <p className="feature-text">
              Role-Based Access Control (Admin, Manager, Staff), 6-digit OTP verification, strict 8+ character password hashing with bcrypt, and JWT sessions.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Architecture Section */}
      <section id="architecture" className="architecture-section">
        <div className="section-header">
          <span className="section-pill">Architecture Showcase</span>
          <h2 className="section-title">Production Polyglot Persistence Architecture</h2>
          <p className="section-desc">
            How ShopAI utilizes both relational SQL and document NoSQL paradigms to deliver rock-solid inventory safety and lightning-fast logging.
          </p>
        </div>

        <div className="arch-diagram-card">
          <div className="arch-layer">
            <div className="arch-box client-box">
              <h4>React 18 + Vite Frontend</h4>
              <p>Recharts Analytics • Lucide React • Vanilla CSS Design System • Auth Modals</p>
            </div>
          </div>

          <div className="arch-arrow">⬇ REST API JSON Requests (Port 5002) ⬇</div>

          <div className="arch-layer">
            <div className="arch-box server-box">
              <h4>Node.js + Express REST API Gateway</h4>
              <p>JWT Auth Middleware • Inventory Controller • PO Pipeline Engine • RBAC Enforcement</p>
            </div>
          </div>

          <div className="arch-arrow">⬇ Dual Database Sync ⬇</div>

          <div className="arch-db-row">
            <div className="arch-db-box pg-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Database size={20} color="#38bdf8" />
                <h4 style={{ margin: 0, color: '#38bdf8' }}>PostgreSQL 17 (Relational)</h4>
              </div>
              <ul>
                <li><code>products</code> (Catalog, live stocks, thresholds)</li>
                <li><code>purchase_orders</code> (Reorder pipeline stages)</li>
                <li><code>orders</code> & <code>order_items</code> (ACID sales transactions)</li>
                <li><code>users</code> (BCrypt hashed credentials & roles)</li>
              </ul>
            </div>

            <div className="arch-db-box mongo-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Layers size={20} color="#34d399" />
                <h4 style={{ margin: 0, color: '#34d399' }}>MongoDB 9 (Document Store)</h4>
              </div>
              <ul>
                <li><code>activitylogs</code> (High-speed write audit trails)</li>
                <li>Authentication history (Login, OTP timestamps)</li>
                <li>Low-stock & critical depletion alerts</li>
                <li>Immutable event tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section className="features-section" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <ROICalculator />
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <span className="section-pill">Pricing Plans</span>
          <h2 className="section-title">Transparent Plans for Scaling Brands</h2>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Starter</h3>
            <div className="price-tag">$29<span>/month</span></div>
            <p className="price-desc">Ideal for small boutiques and emerging direct-to-consumer brands.</p>
            <ul className="price-features">
              <li><CheckCircle size={15} color="#10b981" /> Up to 500 Active SKUs</li>
              <li><CheckCircle size={15} color="#10b981" /> Manual Reorder Pipeline</li>
              <li><CheckCircle size={15} color="#10b981" /> Standard Email Alerts</li>
              <li><CheckCircle size={15} color="#10b981" /> 2 Team Accounts</li>
            </ul>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '20px' }} onClick={onLaunchApp}>
              Start Free Trial
            </button>
          </div>

          <div className="pricing-card popular">
            <div className="popular-badge">Most Popular</div>
            <h3>Growth & Scale</h3>
            <div className="price-tag">$99<span>/month</span></div>
            <p className="price-desc">For fast-growing multichannel retailers requiring autonomous replenishment.</p>
            <ul className="price-features">
              <li><CheckCircle size={15} color="#10b981" /> Unlimited Product SKUs</li>
              <li><CheckCircle size={15} color="#10b981" /> Autonomous AI Reorder Engine</li>
              <li><CheckCircle size={15} color="#10b981" /> PostgreSQL + MongoDB Dual Sync</li>
              <li><CheckCircle size={15} color="#10b981" /> Recharts Advanced Analytics</li>
              <li><CheckCircle size={15} color="#10b981" /> Unlimited Team Accounts & RBAC</li>
            </ul>
            <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={onLaunchApp}>
              Launch Growth Plan
            </button>
          </div>

          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price-tag">Custom</div>
            <p className="price-desc">Dedicated infrastructure, bespoke ERP webhooks, and 24/7 SLA.</p>
            <ul className="price-features">
              <li><CheckCircle size={15} color="#10b981" /> Dedicated PostgreSQL Instances</li>
              <li><CheckCircle size={15} color="#10b981" /> Custom Supplier EDI Integration</li>
              <li><CheckCircle size={15} color="#10b981" /> Multi-Warehouse Tracking</li>
              <li><CheckCircle size={15} color="#10b981" /> 99.99% Uptime Guarantee</li>
            </ul>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '20px' }} onClick={onLaunchApp}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-logo" style={{ width: '28px', height: '28px', fontSize: '10px' }}>
              <span>AI</span>
            </div>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>ShopAI Inventory Systems</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: '#64748b' }}>
            <span>© 2026 ShopAI Technologies Inc. All rights reserved.</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
              <span className="status-dot" style={{ backgroundColor: '#10b981' }}></span> All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
