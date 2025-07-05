const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  welfareId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WelfareOrganization',
    required: true
  },
  assignedCases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  passwordReset: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add index for faster queries
doctorSchema.index({ email: 1 });
doctorSchema.index({ welfareId: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor; 