//authRoutes.js
const express = require('express');
// const upload = require('../uploads/uploadMiddleware');
const fs = require('fs');
const path = require('path');
const {
  registerUser,
  authUser,
  getUserProfile,
  changePassword,
} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

// router.route('/profile').get(protect, getUserProfile);
router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile); // Protected route
router.post('/change-password', protect, changePassword);

module.exports = router;
