import React from 'react';
import { Search, Plus, Minus, Edit2, Trash2 } from 'lucide-react';

const ProductTable = ({
  products,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  onEditProduct,
  onDeleteProduct,
  onQuickAdjustStock,
  categories = []
}) => {
  // Helper for badge class
  const getBadgeClass = (status) => {
    switch (status) {
      case 'Low Stock':
        return 'low-stock';
      case 'In Stock':
        return 'in-stock';
      case 'Out of Stock':
        return 'out-of-stock';
      case 'Warning':
        return 'warning';
      default:
        return 'in-stock';
    }
  };

  return (
    <div className="table-panel">
      {/* Search and Filters */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">Category: All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              Category: {c}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="Low Stock">Status: Low</option>
          <option value="In Stock">Status: In Stock</option>
          <option value="Warning">Status: Warning</option>
          <option value="Out of Stock">Status: Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Available</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No products found matching filters.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const badgeClass = getBadgeClass(p.status);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="product-cell">
                        <img
                          src={p.image_url || '/products/coconut-oil.svg'}
                          alt={p.name}
                          className="product-thumb"
                          onError={(e) => {
                            e.target.src = '/products/coconut-oil.svg';
                          }}
                        />
                        <div>
                          <span className="product-name">{p.name}</span>
                          <span className="product-category-sub">{p.category} • ${Number(p.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="sku-text">{p.sku}</span>
                    </td>
                    <td>
                      <span className="available-units">{p.available_stock} units</span>
                    </td>
                    <td>
                      <span className={`status-badge ${badgeClass}`}>
                        <span className="status-dot"></span>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="icon-btn"
                          title="Quick Add 1 Unit"
                          onClick={() => onQuickAdjustStock(p, 1)}
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Quick Remove 1 Unit"
                          disabled={p.available_stock <= 0}
                          onClick={() => onQuickAdjustStock(p, -1)}
                        >
                          <Minus size={13} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Edit Product"
                          onClick={() => onEditProduct(p)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="icon-btn delete"
                          title="Delete Product"
                          onClick={() => onDeleteProduct(p.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
