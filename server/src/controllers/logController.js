const Log = require('../models/Log');

// GET /api/logs
const getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const logs = await Log.find().sort({ createdAt: -1 }).limit(limit);
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getLogs
};
