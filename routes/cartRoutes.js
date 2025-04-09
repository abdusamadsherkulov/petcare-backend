const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  clearCart,
} = require('../controllers/cartController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.delete('/clear', protect, clearCart);

module.exports = router;
