const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Store user data in req.user
      req.user = decoded;

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({message: 'Not authorized, token failed'});
    }
  }

  if (!token) {
    res.status(401).json({message: 'Not authorized, no token'});
  }
};

module.exports = protect;
