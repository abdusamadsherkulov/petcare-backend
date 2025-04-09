const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  clearCart,
  removeFromCart,
} = require('../controllers/cartController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.delete('/clear', protect, clearCart);
router.post('/remove', protect, removeFromCart);

module.exports = router;
