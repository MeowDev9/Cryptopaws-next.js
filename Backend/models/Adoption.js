const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Dog', 'Cat', 'Other']
  },
  breed: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  size: {
    type: String,
    required: true,
    enum: ['Small', 'Medium', 'Large']
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  location: {
    type: String,
    required: true
  },
  health: {
    type: String
  },
  behavior: {
    type: String
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'adopted'],
    default: 'available'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postedByType: {
    type: String,
    required: true,
    enum: ['donor', 'welfare']
  },
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Adoption || mongoose.model('Adoption', adoptionSchema); 