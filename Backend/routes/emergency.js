const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Emergency = require('../models/Emergency');
const Case = require('../models/Case');
const auth = require("../middleware/auth");
const verifyWelfareToken = require("../middleware/welfaremiddleware");
const verifyAdmin = require("../middleware/authmiddleware");
const WelfareOrganization = require('../models/WelfareOrganization');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/emergencies");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Save files in the "uploads/emergencies" folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});

const upload = multer({ storage });

// POST: Create a new emergency report (public route - no auth required)
router.post("/", upload.array("images"), async (req, res) => {
    try {
        console.log('Received emergency report data:', req.body);
        
        const emergencyReport = new Emergency({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email || '',
            animalType: req.body.animalType,
            condition: req.body.condition,
            location: req.body.location,
            description: req.body.description,
            images: req.files ? req.files.map(file => `/uploads/emergencies/${path.basename(file.path)}`) : []
        });

        console.log('Created emergency report object:', emergencyReport);

        const savedReport = await emergencyReport.save();
        console.log('Saved emergency report:', savedReport);

        res.status(200).json({ 
            message: "Emergency reported successfully",
            report: savedReport 
        });
    } catch (error) {
        console.error('Error saving emergency report:', error);
        res.status(500).json({ 
            message: "Failed to save emergency report", 
            error: error.message 
        });
    }
});

// GET: Retrieve all emergency reports (public route with limited data)
router.get("/public", async (req, res) => {
    try {
        // Only return basic info for public view - exclude phone number and email
        const reports = await Emergency.find({})
            .select('-phone -email')
            .sort({ createdAt: -1 });
        
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reports", error: error.message });
    }
});

// GET: Retrieve all emergency reports (authenticated users get full data)
router.get("/", auth, async (req, res) => {
    try {
        // Allow filtering by status
        const { status } = req.query;
        const filter = {};
        
        if (status) {
            filter.status = status;
        }
        
        // If welfare user, show only non-converted and non-resolved emergencies
        if (req.user.role === 'welfare') {
            filter.$and = [
                { convertedToCase: false },
                { status: { $ne: 'Resolved' } }
            ];
        }
        
        const reports = await Emergency.find(filter)
            .sort({ createdAt: -1 })
            .populate('assignedTo', 'name');
        
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reports", error: error.message });
    }
});

// GET: Retrieve a specific emergency by ID
router.get("/:id", auth, async (req, res) => {
    try {
        const emergency = await Emergency.findById(req.params.id)
            .populate('assignedTo', 'name');
        
        if (!emergency) {
            return res.status(404).json({ message: "Emergency report not found" });
        }
        
        res.json(emergency);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch emergency report", error: error.message });
    }
});

// PUT: Update emergency status and assignment (Welfare only)
router.put("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, medicalIssue, estimatedCost, treatmentPlan } = req.body;
        
        // Find the emergency
        const emergency = await Emergency.findById(id);
        if (!emergency) {
            return res.status(404).json({ message: "Emergency report not found" });
        }
        
        // Check permissions - only allow welfare to update their assigned emergencies
        if (req.user.role !== 'welfare' || 
            (emergency.assignedTo && emergency.assignedTo.toString() !== req.user.id)) {
            return res.status(403).json({ message: "Not authorized to update this emergency" });
        }
        
        // Update fields
        if (status) emergency.status = status;
        if (medicalIssue) emergency.medicalIssue = medicalIssue;
        if (estimatedCost) emergency.estimatedCost = estimatedCost;
        if (treatmentPlan) emergency.treatmentPlan = treatmentPlan;
        
        emergency.updatedAt = Date.now();
        
        const updatedEmergency = await emergency.save();
        
        res.json({
            message: "Emergency report updated successfully",
            emergency: updatedEmergency
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update emergency", error: error.message });
    }
});

// Convert emergency to case
router.post("/:id/convert-to-case", auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    // Check if emergency is already converted or resolved
    if (emergency.convertedToCase || emergency.status === 'Resolved') {
      return res.status(400).json({ message: "Emergency is already handled" });
    }

    // Get the welfare organization
    const welfare = await WelfareOrganization.findById(req.user.id);
    if (!welfare) {
      return res.status(404).json({ message: "Welfare organization not found" });
    }

    // Check if welfare has a connected wallet
    if (!welfare.blockchainAddress) {
      return res.status(400).json({ message: "Please connect your wallet before creating a case" });
    }

    // Create new case
    const newCase = new Case({
      title: req.body.title,
      description: req.body.description,
      targetAmount: req.body.targetAmount,
      imageUrl: emergency.images[0], // Use first emergency image
      createdBy: welfare._id,
      welfareAddress: welfare.blockchainAddress,
      emergencyId: emergency._id
    });

    await newCase.save();

    // Update emergency status - mark as resolved and converted
    emergency.convertedToCase = true;
    emergency.caseId = newCase._id;
    emergency.assignedTo = welfare._id;
    emergency.status = "Resolved";
    emergency.treatmentPlan = `Converted to case: ${newCase._id}`;
    await emergency.save();

    res.status(201).json({
      message: "Emergency successfully converted to case",
      case: newCase
    });
  } catch (error) {
    console.error("Error converting emergency to case:", error);
    res.status(500).json({ message: "Error converting emergency to case" });
  }
});

module.exports = router;
