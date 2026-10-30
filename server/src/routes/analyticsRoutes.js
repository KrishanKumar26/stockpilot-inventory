const express = require('express');
const router = express.Router();
const { getStats, getChartData } = require('../controllers/analyticsController');

router.get('/stats', getStats);
router.get('/charts', getChartData);

module.exports = router;
