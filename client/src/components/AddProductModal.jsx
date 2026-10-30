import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddProductModal = ({ isOpen, onClose, onSave, editingProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Wellness',
    price: '',
    cost_price: '',
    available_stock: '',
    min_stock_threshold: '15',
    reorder_quantity: '50',
    image_url: '/products/coconut-oil.svg'
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        category: editingProduct.category || 'Wellness',
        price: editingProduct.price || '',
        cost_price: editingProduct.cost_price || '',
        available_stock: editingProduct.available_stock !== undefined ? editingProduct.available_stock : '',
        min_stock_threshold: editingProduct.min_stock_threshold || '15',
        reorder_quantity: editingProduct.reorder_quantity || '50',
        image_url: editingProduct.image_url || '/products/coconut-oil.svg'
      });
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
        category: 'Wellness',
        price: '',
        cost_price: '',
        available_stock: '',
        min_stock_threshold: '15',
        reorder_quantity: '50',
        image_url: '/products/coconut-oil.svg'
      });
    }
    setError('');
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.sku.trim()) {
      setError('SKU is required');
      return;
    }

    onSave({
      ...formData,
      price: parseFloat(formData.price) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      available_stock: parseInt(formData.available_stock, 10) || 0,
      min_stock_threshold: parseInt(formData.min_stock_threshold, 10) || 10,
      reorder_quantity: parseInt(formData.reorder_quantity, 10) || 50
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Organic Coconut Oil"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input
                type="text"
                className="form-input"
                placeholder="SKU-84521"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Wellness">Wellness</option>
                <option value="Beverages">Beverages</option>
                <option value="Eco Essentials">Eco Essentials</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Retail Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="24.50"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="13.50"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Available Stock</label>
              <input
                type="number"
                className="form-input"
                placeholder="8"
                value={formData.available_stock}
                onChange={(e) => setFormData({ ...formData, available_stock: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Low Stock Threshold</label>
              <input
                type="number"
                className="form-input"
                placeholder="15"
                value={formData.min_stock_threshold}
                onChange={(e) => setFormData({ ...formData, min_stock_threshold: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Thumbnail Preset</label>
            <select
              className="form-input"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            >
              <option value="/products/coconut-oil.svg">Coconut Oil Bottle (Yellow)</option>
              <option value="/products/coffee-beans.svg">Coffee Beans Pouch (Brown)</option>
              <option value="/products/toothbrushes.svg">Bamboo Toothbrushes (Teal Cup)</option>
              <option value="/products/ceramic-mug.svg">Ceramic Mug (Cream)</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
