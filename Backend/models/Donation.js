const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true
    },
    welfare: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WelfareOrganization",
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    amountUsd: {
      type: Number,
      required: true
    },
    txHash: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Failed"],
      default: "Pending"
    },
    gasUsed: {
      type: String
    },
    gasPrice: {
      type: String
    },
    blockNumber: {
      type: Number
    },
    message: {
      type: String,
      default: ""
    },
    blockchainData: {
      donorAddress: {
        type: String,
        required: true
      },
      organizationAddress: {
        type: String,
        required: true
      },
      timestamp: {
        type: Number,
        required: true
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema); 