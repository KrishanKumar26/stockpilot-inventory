const { query } = require('../config/db');
const Log = require('../models/Log');
const mongoose = require('mongoose');

// In-memory global settings (or can be stored in DB)
let systemSettings = {
  defaultMinStockThreshold: 15,
  defaultReorderQuantity: 50,
  autoReorderEnabled: true,
  emailAlertsEnabled: true,
  smsAlertsEnabled: false,
  maintenanceMode: false
};

// 1. Get All Users (for Admin Management)
const getUsers = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, is_verified, avatar_url, created_at FROM users ORDER BY id ASC'
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// 2. Update User Role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'manager', 'staff'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const check = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const targetUser = check.rows[0];

    const updated = await query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );

    // Log to MongoDB
    try {
      await Log.create({
        action: 'USER_ROLE_UPDATED',
        title: 'User Role Changed',
        description: `Admin ${req.user.name} changed role of ${targetUser.email} to ${role}.`,
        category: 'Administration',
        metadata: { userId: targetUser.id, email: targetUser.email },
        severity: 'warning'
      });
    } catch (mErr) {
      console.warn('Log error:', mErr.message);
    }

    res.json({ success: true, message: 'User role updated successfully', data: updated.rows[0] });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    const check = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const target = check.rows[0];

    await query('DELETE FROM users WHERE id = $1', [id]);

    // Log to MongoDB
    try {
      await Log.create({
        action: 'USER_DELETED',
        title: 'User Account Deleted',
        description: `Admin ${req.user.name} deleted user ${target.email}.`,
        category: 'Administration',
        metadata: { userId: target.id, email: target.email },
        severity: 'warning'
      });
    } catch (mErr) {
      console.warn('Log error:', mErr.message);
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Get System Health & Diagnostics
const getSystemHealth = async (req, res) => {
  try {
    // Check PostgreSQL
    const pgCheck = await query(`
      SELECT
        (SELECT COUNT(*) FROM products) AS total_products,
        (SELECT COUNT(*) FROM purchase_orders) AS total_pos,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COUNT(*) FROM users) AS total_users
    `);

    // Check MongoDB
    let mongoLogsCount = 0;
    let mongoStatus = 'connected';
    try {
      if (mongoose.connection.readyState === 1) {
        mongoLogsCount = await Log.countDocuments();
      } else {
        mongoStatus = 'disconnected';
      }
    } catch (mErr) {
      mongoStatus = 'degraded';
    }

    const uptimeSeconds = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      data: {
        server: {
          status: 'online',
          uptime: `${Math.floor(uptimeSeconds / 60)} minutes`,
          nodeVersion: process.version,
          memoryHeapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
          memoryRssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2)
        },
        database: {
          postgresql: {
            status: 'healthy',
            metrics: pgCheck.rows[0]
          },
          mongodb: {
            status: mongoStatus,
            totalLogs: mongoLogsCount,
            dbName: mongoose.connection.name || 'stockpilot_logs'
          }
        },
        settings: systemSettings
      }
    });
  } catch (err) {
    console.error('System health error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching health' });
  }
};

// 5. Update Global Settings
const updateGlobalSettings = async (req, res) => {
  try {
    const {
      defaultMinStockThreshold,
      defaultReorderQuantity,
      autoReorderEnabled,
      emailAlertsEnabled,
      smsAlertsEnabled,
      maintenanceMode
    } = req.body;

    systemSettings = {
      ...systemSettings,
      defaultMinStockThreshold: defaultMinStockThreshold !== undefined ? Number(defaultMinStockThreshold) : systemSettings.defaultMinStockThreshold,
      defaultReorderQuantity: defaultReorderQuantity !== undefined ? Number(defaultReorderQuantity) : systemSettings.defaultReorderQuantity,
      autoReorderEnabled: autoReorderEnabled !== undefined ? Boolean(autoReorderEnabled) : systemSettings.autoReorderEnabled,
      emailAlertsEnabled: emailAlertsEnabled !== undefined ? Boolean(emailAlertsEnabled) : systemSettings.emailAlertsEnabled,
      smsAlertsEnabled: smsAlertsEnabled !== undefined ? Boolean(smsAlertsEnabled) : systemSettings.smsAlertsEnabled,
      maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : systemSettings.maintenanceMode
    };

    // Log to MongoDB
    try {
      await Log.create({
        action: 'SETTINGS_UPDATED',
        title: 'System Settings Updated',
        description: `Admin ${req.user.name} modified global inventory configurations.`,
        category: 'Administration',
        metadata: { updatedBy: req.user.email },
        severity: 'info'
      });
    } catch (mErr) {
      console.warn('Log error:', mErr.message);
    }

    res.json({
      success: true,
      message: 'Global settings updated successfully',
      data: systemSettings
    });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  getSystemHealth,
  updateGlobalSettings
};
