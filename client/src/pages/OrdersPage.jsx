import React, { useState } from 'react';
import { ShoppingBag, Plus, CheckCircle, Clock } from 'lucide-react';

const OrdersPage = ({ orders, products, onCreateOrder }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    const prod = products.find((p) => p.id === Number(selectedProductId));
    if (!prod) {
      setError('Please select a product');
      return;
    }
    if (prod.available_stock < quantity) {
      setError(`Cannot order ${quantity} units. Only ${prod.available_stock} in stock!`);
      return;
    }

    onCreateOrder({
      customer_name: customerName,
      items: [{ productId: prod.id, quantity: Number(quantity) }]
    });

    setCustomerName('');
    setQuantity(1);
    setIsModalOpen(false);
    setError('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders & Sales</h1>
          <p style={{ color: '#8e9bb2', fontSize: '13px', marginTop: '4px' }}>
            Manage customer orders and real-time inventory deductions in PostgreSQL.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Create Customer Order
        </button>
      </div>

      <div className="table-panel">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No customer orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="sku-text" style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {o.order_number}
                    </span>
                  </td>
                  <td>
                    <span className="product-name">{o.customer_name}</span>
                  </td>
                  <td>
                    <span style={{ color: '#94a3b8', fontSize: '12.5px' }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>
                      ${Number(o.total_amount).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${o.status === 'Completed' ? 'in-stock' : 'warning'}`}>
                      <span className="status-dot"></span>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Customer Sale</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Product to Sell</label>
                <select
                  className="form-input"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.available_stock <= 0}>
                      {p.name} (${Number(p.price).toFixed(2)}) — {p.available_stock} in stock
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
