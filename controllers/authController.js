const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

module.exports = {registerUser, authUser, getUserProfile};
