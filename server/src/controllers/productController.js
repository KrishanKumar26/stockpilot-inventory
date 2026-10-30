const { query } = require('../config/db');
const Log = require('../models/Log');

// Helper to determine status based on stock & threshold
const calculateStatus = (stock, threshold) => {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= Math.floor(threshold * 0.6)) return 'Low Stock';
  if (stock <= threshold) return 'Warning';
  return 'In Stock';
};

// GET /api/products
// Supports search, category, status filters
const getProducts = async (req, res) => {
  try {
    const { search, category, status } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (LOWER(name) LIKE $${paramIndex} OR LOWER(sku) LIKE $${paramIndex})`;
      params.push(`%${search.toLowerCase().trim()}%`);
      paramIndex++;
    }

    if (category && category !== 'All') {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status && status !== 'All') {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ' ORDER BY id ASC';

    const result = await query(sql, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Error in getProducts:', err);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error in getProductById:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category = 'General',
      price = 0,
      cost_price = 0,
      available_stock = 0,
      min_stock_threshold = 10,
      reorder_quantity = 50,
      image_url = '/products/coconut-oil.svg'
    } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ success: false, message: 'Name and SKU are required' });
    }

    const status = calculateStatus(Number(available_stock), Number(min_stock_threshold));

    const insertSql = `
      INSERT INTO products (name, sku, category, price, cost_price, available_stock, min_stock_threshold, reorder_quantity, image_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [name, sku, category, price, cost_price, available_stock, min_stock_threshold, reorder_quantity, image_url, status];

    const result = await query(insertSql, values);
    const newProduct = result.rows[0];

    // Log to MongoDB
    try {
      await Log.create({
        action: 'PRODUCT_CREATED',
        title: 'New Product Added',
        description: `Added "${newProduct.name}" (${newProduct.sku}) with ${newProduct.available_stock} units.`,
        category: 'Inventory',
        metadata: {
          productId: newProduct.id,
          productName: newProduct.name,
          sku: newProduct.sku,
          quantity: newProduct.available_stock
        },
        severity: 'info'
      });
    } catch (logErr) {
      console.warn('Log error:', logErr.message);
    }

    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    console.error('Error creating product:', err);
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      category,
      price,
      cost_price,
      available_stock,
      min_stock_threshold,
      reorder_quantity,
      image_url
    } = req.body;

    // Check existing
    const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const current = existing.rows[0];
    const newStock = available_stock !== undefined ? Number(available_stock) : current.available_stock;
    const newThreshold = min_stock_threshold !== undefined ? Number(min_stock_threshold) : current.min_stock_threshold;
    const status = calculateStatus(newStock, newThreshold);

    const updateSql = `
      UPDATE products
      SET name = COALESCE($1, name),
          sku = COALESCE($2, sku),
          category = COALESCE($3, category),
          price = COALESCE($4, price),
          cost_price = COALESCE($5, cost_price),
          available_stock = COALESCE($6, available_stock),
          min_stock_threshold = COALESCE($7, min_stock_threshold),
          reorder_quantity = COALESCE($8, reorder_quantity),
          image_url = COALESCE($9, image_url),
          status = $10,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const values = [
      name || null,
      sku || null,
      category || null,
      price !== undefined ? price : null,
      cost_price !== undefined ? cost_price : null,
      available_stock !== undefined ? available_stock : null,
      min_stock_threshold !== undefined ? min_stock_threshold : null,
      reorder_quantity !== undefined ? reorder_quantity : null,
      image_url || null,
      status,
      id
    ];

    const result = await query(updateSql, values);
    const updated = result.rows[0];

    // Log to MongoDB
    try {
      await Log.create({
        action: 'PRODUCT_UPDATED',
        title: 'Product Updated',
        description: `Updated "${updated.name}" (${updated.sku}). Current stock: ${updated.available_stock}. Status: ${updated.status}`,
        category: 'Inventory',
        metadata: {
          productId: updated.id,
          productName: updated.name,
          sku: updated.sku,
          quantity: updated.available_stock
        },
        severity: status === 'Low Stock' || status === 'Out of Stock' ? 'warning' : 'info'
      });
    } catch (logErr) {
      console.warn('Log error:', logErr.message);
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const product = existing.rows[0];

    await query('DELETE FROM products WHERE id = $1', [id]);

    // Log to MongoDB
    try {
      await Log.create({
        action: 'PRODUCT_DELETED',
        title: 'Product Deleted',
        description: `Deleted "${product.name}" (${product.sku}) from catalog.`,
        category: 'Inventory',
        metadata: { productId: product.id, productName: product.name, sku: product.sku },
        severity: 'warning'
      });
    } catch (logErr) {
      console.warn('Log error:', logErr.message);
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

// GET /api/products/recommendations (AI Reorder Recommendations)
const getReorderRecommendations = async (req, res) => {
  try {
    // Recommend products that have low stock or out of stock
    const sql = `
      SELECT id, name, sku, available_stock, min_stock_threshold, reorder_quantity, image_url, status, price
      FROM products
      WHERE status IN ('Low Stock', 'Out of Stock', 'Warning')
      ORDER BY available_stock ASC
      LIMIT 5
    `;
    const result = await query(sql);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error in recommendations:', err);
    res.status(500).json({ success: false, message: 'Failed to get recommendations' });
  }
};

// POST /api/products/reorder
const triggerReorder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const prodRes = await query('SELECT * FROM products WHERE id = $1', [productId]);
    if (prodRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const product = prodRes.rows[0];
    const reorderQty = quantity || product.reorder_quantity || 50;
    const poNumber = `PO #${Math.floor(70000 + Math.random() * 20000)}`;
    const cost = (product.cost_price * reorderQty).toFixed(2);
    const supplier = product.category === 'Eco Essentials' ? 'Pacific Traders' : 'EcoGoods Inc.';

    const poSql = `
      INSERT INTO purchase_orders (po_number, product_id, product_name, supplier, quantity, total_cost, status, eta_days)
      VALUES ($1, $2, $3, $4, $5, $6, 'Sent', 'ETA: 4 days')
      RETURNING *
    `;
    const poResult = await query(poSql, [poNumber, product.id, product.name, supplier, reorderQty, cost]);

    // Log to MongoDB
    try {
      await Log.create({
        action: 'REORDER_TRIGGERED',
        title: `Reorder Placed: ${poNumber}`,
        description: `Ordered ${reorderQty} units of "${product.name}" from ${supplier}. Total: $${cost}`,
        category: 'Orders',
        metadata: {
          poNumber,
          productId: product.id,
          productName: product.name,
          quantity: reorderQty
        },
        severity: 'success'
      });
    } catch (logErr) {
      console.warn('Log error:', logErr.message);
    }

    res.json({
      success: true,
      message: `Reordered ${reorderQty} units of ${product.name}`,
      data: poResult.rows[0]
    });
  } catch (err) {
    console.error('Error triggering reorder:', err);
    res.status(500).json({ success: false, message: 'Failed to trigger reorder' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getReorderRecommendations,
  triggerReorder
};
