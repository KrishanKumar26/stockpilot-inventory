const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getSystemHealth,
  updateGlobalSettings
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require valid token and admin role
router.use(verifyToken, requireAdmin);

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/health', getSystemHealth);
router.put('/settings', updateGlobalSettings);

module.exports = router;
