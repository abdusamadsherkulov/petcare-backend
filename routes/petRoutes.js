// routes/petRoutes.js
const express = require('express');
const router = express.Router();
const {
  submitPetRehomingForm,
  getUserPets,
  upload,
} = require('../controllers/petcontroller');
const protect = require('../middleware/authMiddleware');

router.post(
  '/rehoming',
  protect,
  upload.array('photos', 5),
  submitPetRehomingForm
);
router.get('/my-pets', protect, getUserPets);

module.exports = router;
