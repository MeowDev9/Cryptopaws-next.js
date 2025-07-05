const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Donation = require("../models/Donation");
const Case = require("../models/Case");
const verifyDoctorToken = require("../middleware/doctormiddleware");

// Get all donations for a specific case (doctor or welfare only)
router.get("/case/:caseId", verifyDoctorToken, async (req, res) => {
    try {
        const { caseId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(caseId)) {
            return res.status(400).json({ success: false, message: "Invalid case ID format" });
        }
        // Ensure doctor is assigned to this case
        const caseItem = await Case.findById(caseId);
        if (!caseItem || String(caseItem.assignedDoctor) !== String(req.doctor._id)) {
            return res.status(403).json({ success: false, message: "You are not assigned to this case" });
        }
        const donations = await Donation.find({ case: caseId, status: "Confirmed" })
            .sort({ createdAt: -1 })
            .populate('donor', 'name email');
        res.status(200).json({ success: true, donations });
    } catch (error) {
        console.error("Error fetching donations for case:", error);
        res.status(500).json({ success: false, message: "Failed to fetch donations", error: error.message });
    }
});

module.exports = router;
