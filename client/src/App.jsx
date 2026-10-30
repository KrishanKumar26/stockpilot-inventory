import React, { useState, useEffect } from 'react';
import { Plus, Globe, LogIn, ShieldAlert, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import StatCards from './components/StatCards';
import ProductTable from './components/ProductTable';
import AIReorderRecommendations from './components/AIReorderRecommendations';
import AutomatedReorderPipeline from './components/AutomatedReorderPipeline';
import AddProductModal from './components/AddProductModal';
import AuthModal from './components/AuthModal';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import LogsPage from './pages/LogsPage';
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage';
import { api } from './services/api';

function App() {
  // Navigation Screens: 'landing' (Front Page) vs 'app' (Main Workspace)
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' (exact screenshot) | 'dashboard' | 'pricing' | 'marketing' | 'customers' | 'admin' | 'settings' | 'help'

  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login');

  // Business Data State
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [logs, setLogs] = useState([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('Low Stock'); // Matching screenshot "Status: Low"

  // Product Modal & Toast
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Verify stored user session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('shopai_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.data);
            localStorage.setItem('shopai_user', JSON.stringify(res.data));
          } else {
            handleLogout();
          }
        } catch (err) {
          // Keep offline state
        }
      }
    };
    checkSession();
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    showToast(`Welcome back, ${authenticatedUser.name}!`);
    setCurrentScreen('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('shopai_token');
    localStorage.removeItem('shopai_user');
    setUser(null);
    showToast('Signed out successfully.');
  };

  const handleOpenAuth = (view = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  // 1. Fetch Products
  const loadProducts = async () => {
    try {
      const res = await api.getProducts({
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus
      });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // 2. Fetch Auxiliary Data
  const loadAllData = async () => {
    try {
      const [recRes, poRes, statRes, chartRes, ordRes, logRes] = await Promise.all([
        api.getRecommendations(),
        api.getPurchaseOrders(),
        api.getStats(),
        api.getChartData(),
        api.getSalesOrders(),
        api.getLogs()
      ]);

      if (recRes.success) setRecommendations(recRes.data);
      if (poRes.success) setPurchaseOrders(poRes.data);
      if (statRes.success) setStats(statRes.data);
      if (chartRes.success) setChartData(chartRes.data);
      if (ordRes.success) setOrders(ordRes.data);
      if (logRes.success) setLogs(logRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, productData);
        if (res.success) {
          showToast(`Updated "${res.data.name}" successfully!`);
        }
      } else {
        const res = await api.createProduct(productData);
        if (res.success) {
          showToast(`Product "${res.data.name}" added successfully!`);
        }
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      loadProducts();
      loadAllData();
    } catch (err) {
      showToast('Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await api.deleteProduct(id);
        if (res.success) {
          showToast('Product deleted from inventory');
          loadProducts();
          loadAllData();
        }
      } catch (err) {
        showToast('Error deleting product');
      }
    }
  };

  const handleQuickAdjustStock = async (product, delta) => {
    try {
      const newStock = Math.max(0, product.available_stock + delta);
      const res = await api.updateProduct(product.id, { available_stock: newStock });
      if (res.success) {
        showToast(`Stock updated: ${product.name} (${newStock} units)`);
        loadProducts();
        loadAllData();
      }
    } catch (err) {
      showToast('Failed to adjust stock');
    }
  };

  const handleReorder = async (item) => {
    try {
      const res = await api.triggerReorder(item.id, item.reorder_quantity || 50);
      if (res.success) {
        showToast(`AI Reorder Triggered: ${res.data.po_number} generated!`);
        loadAllData();
      }
    } catch (err) {
      showToast('Error triggering reorder');
    }
  };

  const handleAdvancePOStatus = async (po) => {
    try {
      let nextStatus = 'In Transit';
      if (po.status === 'Sent') nextStatus = 'In Transit';
      else if (po.status === 'In Transit') nextStatus = 'Delivered';
      else return;

      const res = await api.updatePOStatus(po.id, nextStatus);
      if (res.success) {
        showToast(`${po.po_number} marked as ${nextStatus}!`);
        loadProducts();
        loadAllData();
      }
    } catch (err) {
      showToast('Error updating PO status');
    }
  };

  const handleCreateCustomerOrder = async (orderData) => {
    try {
      const res = await api.createSalesOrder(orderData);
      if (res.success) {
        showToast(`Order ${res.data.order_number} processed! Stock deducted.`);
        loadProducts();
        loadAllData();
      } else {
        showToast(res.message || 'Failed to create order');
      }
    } catch (err) {
      showToast('Error creating order');
    }
  };

  const categories = ['Wellness', 'Beverages', 'Eco Essentials', 'Home & Kitchen'];

  // IF USER IS ON THE PROFESSIONAL FRONT PAGE (LANDING PAGE)
  if (currentScreen === 'landing') {
    return (
      <>
        <LandingPage
          onLaunchApp={() => setCurrentScreen('app')}
          onOpenAuth={handleOpenAuth}
          isAuthenticated={!!user}
          user={user}
          onOpenAdmin={() => {
            setActiveTab('admin');
            setCurrentScreen('app');
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialView={authModalView}
          onAuthSuccess={handleAuthSuccess}
        />

        {toastMessage && (
          <div className="toast-container">
            <div className="toast">
              <span>✨</span>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  // MAIN SHOPAI WORKSPACE & INVENTORY APPLICATION
  return (
    <div className="app-container">
      {/* 1. Left Sidebar Matching Screenshot */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
        onGoToLanding={() => setCurrentScreen('landing')}
      />

      {/* 2. Main Content Workspace */}
      <main className="main-wrapper">
        {/* Top Header Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setCurrentScreen('landing')}
          >
            <Globe size={14} />
            <span>View Front Page</span>
          </button>

          {user?.role === 'admin' && activeTab !== 'admin' && (
            <button
              type="button"
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                padding: '6px 12px',
                color: '#c084fc',
                borderColor: 'rgba(139, 92, 246, 0.4)'
              }}
              onClick={() => setActiveTab('admin')}
            >
              <ShieldAlert size={14} />
              <span>Admin Panel</span>
            </button>
          )}

          {!user && (
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
              onClick={() => handleOpenAuth('login')}
            >
              <LogIn size={14} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>

        {/* INVENTORY TAB — Exact Pixel-by-Pixel match of reference screenshot! */}
        {activeTab === 'inventory' && (
          <div>
            {/* Page Header */}
            <header className="page-header">
              <h1 className="page-title">Inventory Management</h1>
              <button
                className="btn-primary"
                onClick={() => {
                  setEditingProduct(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={18} />
                <span>Add Product</span>
              </button>
            </header>

            {/* Top 4 Metrics Cards */}
            <StatCards stats={stats} />

            {/* Dashboard 2-Column Grid */}
            <div className="dashboard-grid">
              {/* Center / Left: Product Table & Filters */}
              <ProductTable
                products={products}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                onEditProduct={(p) => {
                  setEditingProduct(p);
                  setIsModalOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
                onQuickAdjustStock={handleQuickAdjustStock}
                categories={categories}
              />

              {/* Right Side Widgets: AI Recommendations & Reorder Pipeline */}
              <div className="sidebar-panel">
                <AIReorderRecommendations
                  recommendations={recommendations}
                  onReorder={handleReorder}
                />
                <AutomatedReorderPipeline
                  purchaseOrders={purchaseOrders}
                  onAdvanceStatus={handleAdvancePOStatus}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            chartData={chartData}
            products={products}
          />
        )}

        {/* Orders Tab */}
        {activeTab === 'pricing' && (
          <OrdersPage
            orders={orders}
            products={products}
            onCreateOrder={handleCreateCustomerOrder}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'marketing' && (
          <DashboardPage
            stats={stats}
            chartData={chartData}
            products={products}
          />
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'customers' && (
          <LogsPage logs={logs} />
        )}

        {/* Admin Panel Tab */}
        {activeTab === 'admin' && (
          <AdminPage
            currentUser={user}
            onNotification={showToast}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="table-panel">
            <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '12px' }}>System Settings & Status</h2>
            <p style={{ color: '#8e9bb2', fontSize: '14px', lineHeight: '1.7' }}>
              <strong>PostgreSQL:</strong> Connected to database <code>stockpilot_db</code> on port 5432.<br />
              <strong>MongoDB:</strong> Connected to <code>stockpilot_logs</code> on port 27017.<br />
              <strong>Backend Server:</strong> Node.js + Express REST API running on port 5002.<br />
              <strong>Frontend Client:</strong> React + Vite running on port 5173.<br />
              <strong>Current User:</strong> {user ? `${user.name} (${user.email}) — ${user.role}` : 'Guest Visitor'}
            </p>
          </div>
        )}

        {/* Help Tab */}
        {activeTab === 'help' && (
          <div className="table-panel">
            <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '12px' }}>Full Stack Architecture Guide</h2>
            <p style={{ color: '#8e9bb2', fontSize: '14px', lineHeight: '1.7' }}>
              Yeh project production-ready 3-tier architecture pe bana hai:<br />
              1. <strong>Front Page (Landing Page):</strong> SaaS homepage featuring live metrics, features, architecture breakdown, and pricing tiers.<br />
              2. <strong>Authentication & Security:</strong> Sign Up, Login, 6-digit OTP verification, Forgot Password flow, and bcrypt password hashing (min. 8 characters must & should).<br />
              3. <strong>Admin Panel:</strong> User RBAC management, real-time database infrastructure diagnostics, and global inventory policies.<br />
              4. <strong>PostgreSQL (Port 5432):</strong> Products, Purchase orders, Customer orders with ACID transactions.<br />
              5. <strong>MongoDB (Port 27017):</strong> Real-time activity logs, stock warning alerts, and audit streams.
            </p>
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* Sign In / Sign Up / OTP / Forgot Password Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
