const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register User
const registerUser = async (req, res) => {
  const {name, email, password} = req.body;

  // Check if user exists
  const userExists = await User.findOne({email});
  if (userExists) {
    return res.status(400).json({message: 'User already exists'});
  }

  // Create a new user
  const newUser = await User.create({
    name,
    email,
    password, // (You should hash this before saving, for security)
  });

  if (newUser) {
    res.status(201).json({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      token: generateToken(newUser._id),
    });
  } else {
    res.status(400).json({message: 'Invalid user data'});
  }
};

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

    res.status(200).json({message: 'Login successful', token});
  } catch (error) {
    res.status(500).json({message: 'Server Error'});
  }
};

module.exports = {registerUser, authUser};

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

module.exports = {registerUser, authUser, getUserProfile};
