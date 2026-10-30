const { pool, query } = require('../config/db');
const Log = require('../models/Log');

// GET /api/orders/pipeline (Automated Reorder Pipeline)
const getPurchaseOrders = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM purchase_orders ORDER BY id DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error in getPurchaseOrders:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/orders/pipeline/:id/status
const updatePOStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Sent', 'In Transit', 'Delivered'

    await client.query('BEGIN');

    const poCheck = await client.query('SELECT * FROM purchase_orders WHERE id = $1', [id]);
    if (poCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    const currentPo = poCheck.rows[0];
    let etaText = currentPo.eta_days;
    if (status === 'Delivered') etaText = 'Received just now';
    if (status === 'In Transit') etaText = 'ETA: 2 days';

    const updateRes = await client.query(
      'UPDATE purchase_orders SET status = $1, eta_days = $2 WHERE id = $3 RETURNING *',
      [status, etaText, id]
    );

    // If delivered, automatically replenish product inventory stock!
    if (status === 'Delivered' && currentPo.status !== 'Delivered' && currentPo.product_id) {
      await client.query(
        `UPDATE products
         SET available_stock = available_stock + $1,
             status = CASE
               WHEN (available_stock + $1) > min_stock_threshold THEN 'In Stock'
               ELSE 'Warning'
             END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [currentPo.quantity, currentPo.product_id]
      );
    }

    await client.query('COMMIT');

    // Log to MongoDB
    try {
      await Log.create({
        action: 'PO_STATUS_UPDATED',
        title: `PO Status Changed to ${status}`,
        description: `${currentPo.po_number} (${currentPo.product_name}) is now marked as ${status}.`,
        category: 'Orders',
        metadata: {
          poNumber: currentPo.po_number,
          productName: currentPo.product_name,
          quantity: currentPo.quantity
        },
        severity: status === 'Delivered' ? 'success' : 'info'
      });
    } catch (mErr) {
      console.warn('Log error:', mErr.message);
    }

    res.json({ success: true, data: updateRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating PO status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

// GET /api/orders (Customer Sales Orders)
const getSalesOrders = async (req, res) => {
  try {
    const ordersRes = await query(`
      SELECT o.*,
             COALESCE(json_agg(json_build_object('id', oi.id, 'product_name', oi.product_name, 'quantity', oi.quantity, 'unit_price', oi.unit_price))
                      FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.id DESC
    `);
    res.json({ success: true, data: ordersRes.rows });
  } catch (err) {
    console.error('Error fetching sales orders:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/orders (Create New Customer Order & Deduct Inventory)
const createSalesOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_name, items } = req.body; // items: [{ productId, quantity }]

    if (!customer_name || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer name and items are required' });
    }

    await client.query('BEGIN');

    let totalAmount = 0;
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Verify and compute total
    const itemRecords = [];
    for (const item of items) {
      const prodRes = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.productId]);
      if (prodRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: `Product ID ${item.productId} not found` });
      }

      const prod = prodRes.rows[0];
      if (prod.available_stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.name}". Available: ${prod.available_stock}, Requested: ${item.quantity}`
        });
      }

      const lineTotal = Number(prod.price) * item.quantity;
      totalAmount += lineTotal;

      itemRecords.push({
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        unitPrice: prod.price,
        remainingStock: prod.available_stock - item.quantity,
        threshold: prod.min_stock_threshold
      });
    }

    // 2. Insert Order
    const orderRes = await client.query(
      'INSERT INTO orders (order_number, customer_name, total_amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [orderNumber, customer_name, totalAmount.toFixed(2), 'Completed']
    );
    const newOrder = orderRes.rows[0];

    // 3. Insert Items and Deduct Stock
    for (const item of itemRecords) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)',
        [newOrder.id, item.productId, item.productName, item.quantity, item.unitPrice]
      );

      // Determine updated status
      let newStatus = 'In Stock';
      if (item.remainingStock <= 0) newStatus = 'Out of Stock';
      else if (item.remainingStock <= Math.floor(item.threshold * 0.6)) newStatus = 'Low Stock';
      else if (item.remainingStock <= item.threshold) newStatus = 'Warning';

      await client.query(
        'UPDATE products SET available_stock = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [item.remainingStock, newStatus, item.productId]
      );
    }

    await client.query('COMMIT');

    // 4. Log to MongoDB
    try {
      await Log.create({
        action: 'ORDER_CREATED',
        title: `New Sale: ${orderNumber}`,
        description: `Order ${orderNumber} placed by ${customer_name}. Total: $${totalAmount.toFixed(2)}.`,
        category: 'Sales',
        metadata: {
          orderNumber,
          quantity: items.reduce((acc, i) => acc + i.quantity, 0)
        },
        severity: 'success'
      });
    } catch (mErr) {
      console.warn('Log error:', mErr.message);
    }

    res.status(201).json({ success: true, data: newOrder });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating sales order:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

module.exports = {
  getPurchaseOrders,
  updatePOStatus,
  getSalesOrders,
  createSalesOrder
};
