//Pet.js
const mongoose = require('mongoose');

const petSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {type: String, required: true},
    species: {type: String, required: true},
    breed: {type: String, required: true},
    age: {type: String, required: true},
    health: {type: String, required: true},
    reason: {type: String, required: true},
    cost: {
      type: String,
      required: true, // Optional field, won't break existing data
      default: 0,
    },
    location: {type: String, required: true},
    phone: {type: String, required: true},
    photos: [String], // Store Google Drive image URLs
    status: {
      type: String,
      enum: ['Available', 'Adopted', 'Pending'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
