// API Service to interact with the Express Backend

const BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('shopai_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Authentication
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async register(name, email, password, role = 'manager') {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    return res.json();
  },

  async verifyOTP(email, otp) {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return res.json();
  },

  async resendOTP(email) {
    const res = await fetch(`${BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async forgotPassword(email) {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async resetPassword(email, otp, newPassword) {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Admin Management
  async getUsers() {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateUserRole(id, role) {
    const res = await fetch(`${BASE_URL}/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getSystemHealth() {
    const res = await fetch(`${BASE_URL}/admin/health`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateGlobalSettings(settings) {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);

    const res = await fetch(`${BASE_URL}/products?${query.toString()}`);
    return res.json();
  },

  async getRecommendations() {
    const res = await fetch(`${BASE_URL}/products/recommendations`);
    return res.json();
  },

  async createProduct(productData) {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async triggerReorder(productId, quantity) {
    const res = await fetch(`${BASE_URL}/products/reorder`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
    return res.json();
  },

  // Purchase Order Pipeline
  async getPurchaseOrders() {
    const res = await fetch(`${BASE_URL}/orders/pipeline`);
    return res.json();
  },

  async updatePOStatus(id, status) {
    const res = await fetch(`${BASE_URL}/orders/pipeline/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Sales Orders
  async getSalesOrders() {
    const res = await fetch(`${BASE_URL}/orders`);
    return res.json();
  },

  async createSalesOrder(orderData) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return res.json();
  },

  // Analytics
  async getStats() {
    const res = await fetch(`${BASE_URL}/analytics/stats`);
    return res.json();
  },

  async getChartData() {
    const res = await fetch(`${BASE_URL}/analytics/charts`);
    return res.json();
  },

  // Activity Logs
  async getLogs(limit = 25) {
    const res = await fetch(`${BASE_URL}/logs?limit=${limit}`);
    return res.json();
  },

  // AI Copilot & Demand Intelligence
  async askAICopilot(prompt) {
    const res = await fetch(`${BASE_URL}/ai/copilot`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt })
    });
    return res.json();
  }
};
