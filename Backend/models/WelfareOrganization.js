const mongoose = require("mongoose");

const WelfareOrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ✅ Correct key
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  phone: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, required: true },
  website: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  bio: { type: String, default: "" },
  socialLinks: {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
  },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  blockchainAddress: { type: String, sparse: true },
  blockchainTxHash: { type: String, default: null },
  blockchainStatus: { 
    isRegistered: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    totalDonations: { type: String, default: "0" },
    uniqueDonors: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

WelfareOrganizationSchema.index({ blockchainAddress: 1 }, { unique: false, sparse: true });

module.exports = mongoose.model("WelfareOrganization", WelfareOrganizationSchema);
