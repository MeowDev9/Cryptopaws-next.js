const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema({
  adoptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Adoption', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  reason: { type: String, required: true },
  preferredContact: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'payment pending', 'under review', 'completed'], default: 'pending' },
  paymentProof: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema); 