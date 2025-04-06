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
