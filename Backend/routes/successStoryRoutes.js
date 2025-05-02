const express = require("express");
const router = express.Router();
const CaseUpdate = require("../models/CaseUpdate");

// Get all public success stories
router.get("/", async (req, res) => {
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

// Get success stories for a specific case
router.get("/case/:caseId", async (req, res) => {
    try {
        const { caseId } = req.params;
        
        const successStories = await CaseUpdate.find({ 
            caseId,
            isSuccessStory: true,
            isPublished: true 
        })
        .sort({ createdAt: -1 })
        .populate('postedBy', 'name');
        
        res.status(200).json({
            success: true,
            successStories
        });
    } catch (error) {
        console.error("Error fetching case success stories:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch case success stories",
            error: error.message
        });
    }
});

// Get success stories for a specific welfare organization
router.get("/welfare/:welfareId", async (req, res) => {
    try {
        const { welfareId } = req.params;
        
        const successStories = await CaseUpdate.find({ 
            postedBy: welfareId,
            isSuccessStory: true,
            isPublished: true 
        })
        .sort({ createdAt: -1 })
        .populate('caseId', 'title imageUrl');
        
        res.status(200).json({
            success: true,
            successStories
        });
    } catch (error) {
        console.error("Error fetching welfare success stories:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch welfare success stories",
            error: error.message
        });
    }
});

module.exports = router; 