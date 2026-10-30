const { pool, initDB } = require('../config/db');
const { connectMongo } = require('../config/mongo');
const Log = require('../models/Log');
const mongoose = require('mongoose');

const seedData = async () => {
  console.log('🌱 Starting Database Seeding...');

  // 1. Initialize PostgreSQL tables
  await initDB();

  // Clear existing table records
  await pool.query('DELETE FROM users;');
  await pool.query('DELETE FROM order_items;');
  await pool.query('DELETE FROM orders;');
  await pool.query('DELETE FROM purchase_orders;');
  await pool.query('DELETE FROM products;');

  // Reset IDs
  await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1;');
  await pool.query('ALTER SEQUENCE products_id_seq RESTART WITH 1;');
  await pool.query('ALTER SEQUENCE purchase_orders_id_seq RESTART WITH 1;');
  await pool.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1;');
  await pool.query('ALTER SEQUENCE order_items_id_seq RESTART WITH 1;');

  // 2. Insert Products (matching screenshot + extra realistic catalog)
  const products = [
    {
      name: 'Organic Coconut Oil',
      sku: 'SKU-84521',
      category: 'Wellness',
      price: 24.50,
      cost_price: 13.50,
      available_stock: 8,
      min_stock_threshold: 15,
      reorder_quantity: 50,
      image_url: '/products/coconut-oil.svg',
      status: 'Low Stock'
    },
    {
      name: 'Artisanal Coffee Beans',
      sku: 'SKU-78932',
      category: 'Beverages',
      price: 18.99,
      cost_price: 9.20,
      available_stock: 52,
      min_stock_threshold: 15,
      reorder_quantity: 40,
      image_url: '/products/coffee-beans.svg',
      status: 'In Stock'
    },
    {
      name: 'Bamboo Toothbrushes',
      sku: 'SKU-11245',
      category: 'Eco Essentials',
      price: 12.00,
      cost_price: 4.50,
      available_stock: 0,
      min_stock_threshold: 20,
      reorder_quantity: 100,
      image_url: '/products/toothbrushes.svg',
      status: 'Out of Stock'
    },
    {
      name: 'Handmade Ceramic Mug',
      sku: 'SKU-65489',
      category: 'Home & Kitchen',
      price: 32.00,
      cost_price: 15.00,
      available_stock: 21,
      min_stock_threshold: 25,
      reorder_quantity: 30,
      image_url: '/products/ceramic-mug.svg',
      status: 'Warning'
    },
    {
      name: 'Matcha Ceremonial Grade',
      sku: 'SKU-99210',
      category: 'Beverages',
      price: 28.50,
      cost_price: 14.00,
      available_stock: 64,
      min_stock_threshold: 15,
      reorder_quantity: 45,
      image_url: '/products/coffee-beans.svg',
      status: 'In Stock'
    },
    {
      name: 'Aroma Diffuser Ultrasonic',
      sku: 'SKU-44129',
      category: 'Wellness',
      price: 45.00,
      cost_price: 22.00,
      available_stock: 6,
      min_stock_threshold: 10,
      reorder_quantity: 25,
      image_url: '/products/ceramic-mug.svg',
      status: 'Low Stock'
    }
  ];

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (name, sku, category, price, cost_price, available_stock, min_stock_threshold, reorder_quantity, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [p.name, p.sku, p.category, p.price, p.cost_price, p.available_stock, p.min_stock_threshold, p.reorder_quantity, p.image_url, p.status]
    );
  }
  console.log(`✅ Inserted ${products.length} products into PostgreSQL.`);

  // 3. Insert Purchase Orders (matching screenshot "Automated Reorder Pipeline")
  const purchaseOrders = [
    {
      po_number: 'PO #78912',
      product_id: 1,
      product_name: 'Organic Coconut Oil',
      supplier: 'EcoGoods Inc.',
      quantity: 50,
      total_cost: 675.00,
      status: 'Sent',
      eta_days: '5 days'
    },
    {
      po_number: 'PO #78905',
      product_id: 3,
      product_name: 'Bamboo Toothbrushes',
      supplier: 'Pacific Traders',
      quantity: 100,
      total_cost: 450.00,
      status: 'In Transit',
      eta_days: 'ETA: 3 days'
    },
    {
      po_number: 'PO #78890',
      product_id: 4,
      product_name: 'Handmade Ceramic Mug',
      supplier: 'Artisan Clayworks',
      quantity: 30,
      total_cost: 450.00,
      status: 'Delivered',
      eta_days: 'Received 2 days ago'
    }
  ];

  for (const po of purchaseOrders) {
    await pool.query(
      `INSERT INTO purchase_orders (po_number, product_id, product_name, supplier, quantity, total_cost, status, eta_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [po.po_number, po.product_id, po.product_name, po.supplier, po.quantity, po.total_cost, po.status, po.eta_days]
    );
  }
  console.log(`✅ Inserted ${purchaseOrders.length} purchase orders.`);

  // 4. Insert Sample Sales Orders & Items
  const sampleOrders = [
    { order_number: 'ORD-9801', customer_name: 'Sarah Connor', total_amount: 98.50, status: 'Completed' },
    { order_number: 'ORD-9802', customer_name: 'David Miller', total_amount: 142.00, status: 'Completed' },
    { order_number: 'ORD-9803', customer_name: 'Elena Rostova', total_amount: 45.00, status: 'Processing' },
    { order_number: 'ORD-9804', customer_name: 'Marcus Vance', total_amount: 215.80, status: 'Completed' }
  ];

  for (let i = 0; i < sampleOrders.length; i++) {
    const o = sampleOrders[i];
    const ordRes = await pool.query(
      `INSERT INTO orders (order_number, customer_name, total_amount, status)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [o.order_number, o.customer_name, o.total_amount, o.status]
    );
    const orderId = ordRes.rows[0].id;

    // insert 2 sample order items
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, 1, 'Organic Coconut Oil', 2, 24.50]
    );
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, 2, 'Artisanal Coffee Beans', 1, 18.99]
    );
  }
  // 4b. Seed Users (Admin & Team)
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('Password123', 10);
  const users = [
    {
      name: 'Alex Mitchell',
      email: 'admin@shopai.com',
      password_hash: passwordHash,
      role: 'admin',
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Elena Rostova',
      email: 'manager@shopai.com',
      password_hash: passwordHash,
      role: 'manager',
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'David Miller',
      email: 'staff@shopai.com',
      password_hash: passwordHash,
      role: 'staff',
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    }
  ];

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_verified, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [u.name, u.email, u.password_hash, u.role, u.is_verified, u.avatar_url]
    );
  }
  console.log(`✅ Inserted ${users.length} initial users into PostgreSQL.`);

  // 5. Seed MongoDB Activity Logs
  try {
    await connectMongo();
    if (mongoose.connection.readyState === 1) {
      await Log.deleteMany({});
      await Log.create([
        {
          action: 'SYSTEM_INIT',
          title: 'System Initialized',
          description: 'ShopAI inventory system synchronized with PostgreSQL and MongoDB.',
          category: 'System',
          severity: 'info'
        },
        {
          action: 'LOW_STOCK_ALERT',
          title: 'Low Stock Alert Triggered',
          description: 'Organic Coconut Oil (SKU-84521) reached 8 units (Threshold: 15).',
          category: 'Inventory',
          metadata: { productId: 1, productName: 'Organic Coconut Oil', sku: 'SKU-84521', quantity: 8 },
          severity: 'warning'
        },
        {
          action: 'LOW_STOCK_ALERT',
          title: 'Out of Stock Alert',
          description: 'Bamboo Toothbrushes (SKU-11245) stock reached 0 units.',
          category: 'Inventory',
          metadata: { productId: 3, productName: 'Bamboo Toothbrushes', sku: 'SKU-11245', quantity: 0 },
          severity: 'critical'
        },
        {
          action: 'REORDER_TRIGGERED',
          title: 'AI Reorder PO Generated',
          description: 'Auto-generated PO #78912 to EcoGoods Inc. for 50 units of Organic Coconut Oil.',
          category: 'Orders',
          metadata: { poNumber: 'PO #78912', productName: 'Organic Coconut Oil', quantity: 50 },
          severity: 'success'
        }
      ]);
      console.log('✅ Inserted initial Activity Logs in MongoDB.');
    }
  } catch (mErr) {
    console.warn('MongoDB log seeding note:', mErr.message);
  }

  console.log('🎉 Database seeding completed successfully!');
  await pool.end();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
