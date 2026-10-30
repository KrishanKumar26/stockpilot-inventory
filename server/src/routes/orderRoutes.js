const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  updatePOStatus,
  getSalesOrders,
  createSalesOrder
} = require('../controllers/orderController');

router.get('/pipeline', getPurchaseOrders);
router.patch('/pipeline/:id/status', updatePOStatus);
router.get('/', getSalesOrders);
router.post('/', createSalesOrder);

module.exports = router;
