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
    required: true,
    refPath: 'postedByType'
  },
  postedByType: {
    type: String,
    required: true,
    enum: ['User', 'WelfareOrganization']
  },
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adoptionFee: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Adoption || mongoose.model('Adoption', adoptionSchema); 