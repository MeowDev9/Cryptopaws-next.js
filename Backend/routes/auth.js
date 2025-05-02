const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library"); 
const User = require("../models/User");
const WelfareOrganization = require("../models/WelfareOrganization"); 
const Case = require("../models/Case");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Custom middleware to verify authentication token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Signup Route (Manual Signup - Email & Password)
router.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const emailLower = email.toLowerCase();
        const existingUser = await User.findOne({ email: emailLower }) || await WelfareOrganization.findOne({ email: emailLower });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;
        if (role.toLowerCase() === "donor") {
            newUser = new User({ name, email: emailLower, password: hashedPassword, role: "donor" });
        } else if (role.toLowerCase() === "welfare") {
            newUser = new WelfareOrganization({ name, email: emailLower, password: hashedPassword, role: "welfare" });
        } else {
            return res.status(400).json({ message: "Invalid role selection." });
        }

        await newUser.save();
        res.status(201).json({ message: "Account created successfully." });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});

// ✅ Signin Route (Manual Login - Email & Password)
router.post("/signin", async (req, res) => {
    const { email, password, role } = req.body;  

    if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required for login." });
    }

    try {
        const emailLower = email.toLowerCase();
        let user;

        if (role.toLowerCase() === "donor") {
            user = await User.findOne({ email: emailLower });
        } else if (role.toLowerCase() === "welfare") {
            user = await WelfareOrganization.findOne({ email: emailLower });
        } else {
            return res.status(400).json({ message: "Invalid role selected." });
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        if (!user.password) {
            return res.status(400).json({ message: "This account uses Google Sign-In. Please log in with Google." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Signin successful.", token, role: user.role });

    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});

// ✅ Google Sign-In API (Fixed Token Handling)
router.post("/google", async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: "Google token is required." });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;
        const emailLower = email.toLowerCase();

        let user = await User.findOne({ email: emailLower });

        if (!user) {
            user = new User({
                name,
                email: emailLower,
                password: null, // No password for Google users
                role: "donor",
                profilePicture: picture,
            });

            await user.save();
        }

        const authToken = jwt.sign({ id: user._id, role: "donor" }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            message: "Google Sign-In successful.",
            token: authToken,
            role: "donor",
            user: { name: user.name, email: user.email, profilePicture: user.profilePicture },
        });

    } catch (error) {
        console.error("Google Sign-In Error:", error);
        res.status(500).json({ message: "Failed to authenticate with Google." });
    }
});

// ✅ Get User Profile
router.get("/profile", async (req, res) => {
    try {
        const tokenHeader = req.headers.authorization;
        if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        // Remove "Bearer " before verifying the token
        const token = tokenHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ✅ GET all cases from all welfares (For DonorDashboard)
router.get("/cases/all", async (req, res) => {
    try {
      const cases = await Case.find()
        .populate('createdBy', 'name blockchainAddress')
        .sort({ createdAt: -1 });

      // Log each case's welfare organization data
      cases.forEach(caseItem => {
        console.log('Case:', caseItem._id);
        console.log('Welfare Organization:', caseItem.createdBy);
        console.log('Welfare Address:', caseItem.createdBy?.blockchainAddress);
      });

      res.status(200).json(cases);
    } catch (error) {
      console.error("Error fetching all cases:", error);
      res.status(500).json({ message: "Internal server error" });
    }
});

// Update user profile
router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, phone, address, socialLinks } = req.body;
    
    // Find the user and update their profile
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update the fields that were provided
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (socialLinks) {
      user.socialLinks = {
        ...user.socialLinks,
        ...socialLinks
      };
    }
    
    user.updatedAt = Date.now();
    
    await user.save();
    
    // Return the updated user without the password
    const updatedUser = await User.findById(userId).select("-password");
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
