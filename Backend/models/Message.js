const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WelfareOrganization",
      required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema); 