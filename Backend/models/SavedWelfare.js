const mongoose = require("mongoose");

const savedWelfareSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    welfare: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WelfareOrganization",
      required: true
    }
  },
  { timestamps: true }
);

// Compound index to ensure a donor can save a welfare only once
savedWelfareSchema.index({ donor: 1, welfare: 1 }, { unique: true });

module.exports = mongoose.model("SavedWelfare", savedWelfareSchema); 