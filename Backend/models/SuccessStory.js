const mongoose = require("mongoose");

const successStorySchema = new mongoose.Schema(
  {
    welfare: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WelfareOrganization",
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
    images: {
      type: [String],
      default: []
    },
    relatedCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case"
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuccessStory", successStorySchema); 