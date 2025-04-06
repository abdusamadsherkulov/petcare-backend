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
      // console.log('Decoded token:', decoded);
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
