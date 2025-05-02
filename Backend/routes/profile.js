const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const router = express.Router();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to verify user authentication
const verifyAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; 
    console.log("Token received:", token);  // Log token for debugging

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Decoded token:", decoded); 
        req.userId = decoded.id;  
        next();
    } catch (err) {
        console.error("Token verification error:", err);
        return res.status(403).json({ error: 'Forbidden: Invalid token', details: err.message });
    }
};


router.get('/profile', verifyAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Server error: Could not fetch user data', details: err.message });
    }
});

// Update user profile
router.put('/profile', verifyAuth, async (req, res) => {
    try {
        const { name, email } = req.body;
        // Validate name and email before updating
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { name, email },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(updatedUser);
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({ error: 'Server error: Could not update user profile', details: err.message });
    }
});

// Delete user profile
router.delete('/profile', verifyAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'Account deleted successfully!' });
    } catch (err) {
        console.error('Error deleting user profile:', err);
        res.status(500).json({ error: 'Server error: Could not delete user profile', details: err.message });
    }
});

module.exports = router;
