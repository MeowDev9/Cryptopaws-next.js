const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String }, // Optional: Will be null for Google Sign-In users
    googleId: { type: String, unique: true, sparse: true }, // Store Google ID (Optional)
    role: { type: String, enum: ["donor", "welfare", "admin"], default: "donor" },
    profilePicture: { type: String }, // Stores Google profile picture
    bio: { type: String },
    phone: { type: String },
    address: { type: String },
    socialLinks: {
        twitter: { type: String },
        linkedin: { type: String },
        facebook: { type: String },
        telegram: { type: String }
    },
    savedWelfares: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "WelfareOrganization" 
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});

module.exports = mongoose.model("User", UserSchema);
