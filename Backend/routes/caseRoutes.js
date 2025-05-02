const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Case = require("../models/Case");
const CaseUpdate = require("../models/CaseUpdate");
const verifyToken = require("../middleware/authmiddleware");

// Get a specific case with details (public endpoint)
router.get("/:id", async (req, res) => {
    try {
        const caseId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(caseId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid case ID format" 
            });
        }
        
        const caseItem = await Case.findById(caseId)
            .populate('createdBy', 'name')
            .populate('assignedDoctor', 'name');
        
        if (!caseItem) {
            return res.status(404).json({ 
                success: false, 
                message: "Case not found" 
            });
        }
        
        // Generate a random amountRaised between 0 and targetAmount for demo purposes
        // In a real app, this would be calculated from actual donations
        const caseWithAmountRaised = caseItem.toObject();
        caseWithAmountRaised.amountRaised = Math.floor(Math.random() * caseWithAmountRaised.targetAmount);
        
        res.status(200).json({
            success: true,
            case: caseWithAmountRaised
        });
    } catch (error) {
        console.error("Error fetching case:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch case",
            error: error.message 
        });
    }
});

// Get updates for a specific case (public endpoint)
router.get("/:id/updates", async (req, res) => {
    try {
        const caseId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(caseId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid case ID format" 
            });
        }
        
        // Verify the case exists
        const existingCase = await Case.findById(caseId);
        
        if (!existingCase) {
            return res.status(404).json({ 
                success: false, 
                message: "Case not found" 
            });
        }
        
        // Only return published updates
        const updates = await CaseUpdate.find({ 
            caseId,
            isPublished: true 
        })
        .sort({ createdAt: -1 })
        .populate('postedBy', 'name');
        
        res.status(200).json({
            success: true,
            updates
        });
    } catch (error) {
        console.error("Error fetching case updates:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch case updates",
            error: error.message
        });
    }
});

// Get all success stories (public endpoint)
router.get("/success-stories", async (req, res) => {
    try {
        const successStories = await CaseUpdate.find({ 
            isSuccessStory: true,
            isPublished: true 
        })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('caseId', 'title imageUrl')
        .populate('postedBy', 'name');
        
        res.status(200).json({
            success: true,
            successStories
        });
    } catch (error) {
        console.error("Error fetching success stories:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch success stories",
            error: error.message
        });
    }
});

module.exports = router; 