const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getReorderRecommendations,
  triggerReorder
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/recommendations', getReorderRecommendations);
router.post('/reorder', triggerReorder);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
