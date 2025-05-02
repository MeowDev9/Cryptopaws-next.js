const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const CaseUpdate = require("../models/CaseUpdate");
const Case = require("../models/Case");
const verifyToken = require("../middleware/authmiddleware");
const verifyWelfareToken = require("../middleware/welfaremiddleware");

// Get updates for a specific case (public endpoint)
router.get("/:caseId", async (req, res) => {
    try {
        const { caseId } = req.params;
        
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

// Create a new update for a case (requires welfare authentication)
router.post("/", verifyWelfareToken, async (req, res) => {
    try {
        const { caseId, title, content, imageUrl, isSuccessStory } = req.body;
        
        if (!caseId || !title || !content) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: caseId, title, and content are required"
            });
        }
        
        // Verify the case exists and belongs to this welfare organization
        const existingCase = await Case.findOne({ 
            _id: caseId, 
            createdBy: req.welfare._id 
        });
        
        if (!existingCase) {
            return res.status(404).json({ 
                success: false, 
                message: "Case not found or you don't have permission to update it" 
            });
        }
        
        // Create and save the new update
        const newUpdate = new CaseUpdate({
            caseId,
            title,
            content,
            imageUrl: imageUrl || [],
            postedBy: req.welfare._id,
            isSuccessStory: isSuccessStory || false
        });
        
        await newUpdate.save();
        
        // Update the case to indicate it has updates
        await Case.findByIdAndUpdate(caseId, { hasUpdates: true });
        
        res.status(201).json({
            success: true,
            message: "Case update created successfully",
            update: newUpdate
        });
    } catch (error) {
        console.error("Error creating case update:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create case update",
            error: error.message
        });
    }
});

// Update a case update (requires welfare authentication)
router.put("/:updateId", verifyWelfareToken, async (req, res) => {
    try {
        const { updateId } = req.params;
        const { title, content, imageUrl, isSuccessStory, isPublished } = req.body;
        
        // Find the update and verify ownership
        const update = await CaseUpdate.findById(updateId);
        
        if (!update) {
            return res.status(404).json({
                success: false,
                message: "Update not found"
            });
        }
        
        // Verify the update belongs to this welfare organization
        if (update.postedBy.toString() !== req.welfare._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to modify this update"
            });
        }
        
        // Update fields
        update.title = title || update.title;
        update.content = content || update.content;
        update.imageUrl = imageUrl || update.imageUrl;
        
        if (isSuccessStory !== undefined) {
            update.isSuccessStory = isSuccessStory;
        }
        
        if (isPublished !== undefined) {
            update.isPublished = isPublished;
        }
        
        await update.save();
        
        res.status(200).json({
            success: true,
            message: "Case update modified successfully",
            update
        });
    } catch (error) {
        console.error("Error updating case update:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update case update",
            error: error.message
        });
    }
});

// Delete a case update (requires welfare authentication)
router.delete("/:updateId", verifyWelfareToken, async (req, res) => {
    try {
        const { updateId } = req.params;
        
        // Find the update and verify ownership
        const update = await CaseUpdate.findById(updateId);
        
        if (!update) {
            return res.status(404).json({
                success: false,
                message: "Update not found"
            });
        }
        
        // Verify the update belongs to this welfare organization
        if (update.postedBy.toString() !== req.welfare._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this update"
            });
        }
        
        await CaseUpdate.findByIdAndDelete(updateId);
        
        // Check if there are any updates left for this case
        const remainingUpdates = await CaseUpdate.countDocuments({ caseId: update.caseId });
        
        if (remainingUpdates === 0) {
            // If no updates left, update the case hasUpdates field
            await Case.findByIdAndUpdate(update.caseId, { hasUpdates: false });
        }
        
        res.status(200).json({
            success: true,
            message: "Case update deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting case update:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete case update",
            error: error.message
        });
    }
});

module.exports = router; 