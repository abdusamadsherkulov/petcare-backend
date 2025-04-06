//db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;

//authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Register User
const registerUser = async (req, res) => {
  const {name, surname, email, password} = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({email});
    if (userExists) {
      return res.status(400).json({message: 'User already exists'});
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      name,
      surname,
      email,
      password: hashedPassword, // Save the hashed password
    });

    // Respond with user data and JWT token
    if (newUser) {
      res.status(201).json({
        _id: newUser.id,
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400).json({message: 'Invalid user data'});
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({message: 'Server error'});
  }
};

// Authenticate User (Login)
// Authenticate User (Login)
const authUser = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await User.findOne({email});
    if (!user) return res.status(400).json({message: 'User not found'});

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({message: 'Invalid credentials'});

    // Create JWT token
    const token = jwt.sign(
      {id: user._id},
      process.env.JWT_SECRET,
      {expiresIn: '1h'} // Token valid for 1 hour
    );

    // ✅ Include the user object in the response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({message: 'Server Error'});
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({message: 'Server Error'});
  }
};

// Utility function to generate JWT token
const generateToken = id => {
  return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1h'});
};

// Change password
const changePassword = async (req, res) => {
  const userId = req.user.id; // assuming JWT middleware sets req.user
  const {oldPassword, newPassword} = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({message: 'User not found'});

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({message: 'Old password is incorrect'});

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({message: 'Password changed successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server error'});
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  changePassword,
};

//authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user to request object
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({message: 'Not authorized, token failed'});
    }
  } else {
    res.status(401).json({message: 'Not authorized, no token'});
  }
};

module.exports = protect;

//User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {type: String, required: true},
  surname: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  isAdmin: {type: Boolean, default: false}, // Future role-based access
});

const User = mongoose.model('User', userSchema);

module.exports = User;

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

router.route('/profile').get(protect, getUserProfile);
router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile); // Protected route
router.post('/change-password', protect, changePassword);

module.exports = router;

//server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

const app = express();

dotenv.config();
connectDB();

// ✅ Enable CORS BEFORE routes
app.use(cors());

// ✅ Middleware to parse JSON requests
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);

// ✅ Example test route
app.get('/api/test', (req, res) => {
  res.json({message: 'CORS is enabled!'});
});

// ✅ Start server (ONLY ONCE)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
