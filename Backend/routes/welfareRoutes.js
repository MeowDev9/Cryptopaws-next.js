const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const WelfareOrganization = require("../models/WelfareOrganization");
const verifyWelfareToken = require("../middleware/welfaremiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { ethers } = require("ethers");

const Case = require("../models/Case");
const SuccessStory = require("../models/SuccessStory");
const CaseUpdate = require('../models/CaseUpdate');
const Message = require("../models/Message");
const Donation = require("../models/Donation");


const router = express.Router();

// Welfare Registration Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, description, website, blockchainAddress, blockchainTxHash } = req.body;
    console.log('Received registration request:', req.body);

    if (!name || !email || !password || !phone || !address || !description || !website) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ['name', 'email', 'password', 'phone', 'address', 'description', 'website']
      });
    }

    let welfare = await WelfareOrganization.findOne({ email });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    if (welfare) {
      if (welfare.status === "rejected") {
        // Update existing rejected welfare with new hashed password
        welfare.name = name;
        welfare.password = hashedPassword;
        welfare.phone = phone;
        welfare.address = address;
        welfare.description = description;
        welfare.website = website;
        welfare.status = "pending";
        welfare.blockchainAddress = blockchainAddress || null;
        welfare.blockchainTxHash = blockchainTxHash || null;
        welfare.blockchainStatus = {
          isRegistered: false,
          isActive: false,
          totalDonations: "0",
          uniqueDonors: 0
        };
    
        await welfare.save();
        return res.status(201).json({ message: "Registration request submitted successfully!" });
      } else {
        return res.status(400).json({ message: "Organization already registered!" });
      }
    }
    
    // Create new welfare entry
    welfare = new WelfareOrganization({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      description,
      website,
      status: "pending",
      blockchainAddress: blockchainAddress || null,
      blockchainTxHash: blockchainTxHash || null,
      blockchainStatus: {
        isRegistered: false,
        isActive: false,
        totalDonations: "0",
        uniqueDonors: 0
      }
    });

    await welfare.save();
    res.status(201).json({ message: "Registration request submitted successfully!", organization: welfare });
  } catch (error) {
    console.error('Welfare registration error:', error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
});

// Welfare Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const welfare = await WelfareOrganization.findOne({ email });
    if (!welfare) {
      return res.status(404).json({ message: "Welfare organization not found" });
    }

    if (welfare.status !== "approved") {
      return res.status(403).json({ message: "Your account is not approved yet." });
    }

    const isMatch = await bcrypt.compare(password, welfare.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: welfare._id, role: "welfare" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Welfare login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/cases"; // Ensure cases folder is used

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // Create folder if missing
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/welfare_profile_pics";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const profilePicUpload = multer({ storage: profilePicStorage });


const upload = multer({ storage: storage }); // ✅ Fix: Define `upload`

// ✅ POST a new case (Welfare creates a case)
router.post("/cases", verifyWelfareToken, upload.array("images"), async (req, res) => {
  try {
    const welfareId = req.user.id; // Extract welfare ID from token
    const { title, description, targetAmount, assignedDoctor, medicalIssue, welfareAddress } = req.body;

    // Debug logging
    console.log("Received case creation request:", {
      welfareId,
      title,
      description,
      targetAmount,
      assignedDoctor,
      medicalIssue,
      welfareAddress,
      files: req.files,
      body: req.body
    });

    // Check if wallet address is provided
    if (!welfareAddress) {
      console.error("Missing wallet address");
      return res.status(400).json({ 
        message: "Wallet address is required. Please connect your wallet before creating a case." 
      });
    }

    // Get the welfare organization
    const welfare = await WelfareOrganization.findById(welfareId);
    if (!welfare) {
      console.error("Welfare organization not found:", welfareId);
      return res.status(404).json({ message: "Welfare organization not found" });
    }

    // Update the welfare organization's blockchain address with the provided wallet address
    welfare.blockchainAddress = welfareAddress;
    await welfare.save();

    // Log welfare details including blockchain address
    console.log("Welfare organization found:", {
      id: welfare._id,
      name: welfare.name,
      welfareAddress: welfareAddress
    });

    // Collect the paths of all uploaded images
    const imagePaths = req.files ? req.files.map(file => `cases/${file.filename}`) : [];  // Multiple images

    // Parsing the cost breakdown fields from the form
    const surgery = parseFloat(req.body.surgery) || 0;
    const medicine = parseFloat(req.body.medicine) || 0;
    const recovery = parseFloat(req.body.recovery) || 0;
    const other = parseFloat(req.body.other) || 0;

    // Debugging logs
    console.log("Parsed cost breakdown:", {
      surgery,
      medicine,
      recovery,
      other,
      total: surgery + medicine + recovery + other
    });

    // Ensure all required fields are present
    if (!title || !description || !targetAmount) {
      console.error("Missing required fields:", { title, description, targetAmount });
      return res.status(400).json({ message: "Title, description, and target amount are required." });
    }

    // Create and save the new case with all fields
    const newCase = new Case({
      title,
      description,
      targetAmount,
      imageUrl: imagePaths,  // Save multiple image paths as an array
      assignedDoctor,
      medicalIssue,
      costBreakdown: [
        { item: "Surgery", cost: surgery },
        { item: "Medicine", cost: medicine },
        { item: "Recovery", cost: recovery },
        { item: "Other", cost: other }
      ],
      createdBy: welfareId, // Assign the case to the logged-in welfare
      welfareAddress // Use the provided wallet address
    });

    console.log("Attempting to save new case:", {
      title: newCase.title,
      targetAmount: newCase.targetAmount,
      imageUrl: newCase.imageUrl,
      costBreakdown: newCase.costBreakdown
    });

    await newCase.save();
    console.log("New case added with details:", {
      caseId: newCase._id,
      title: newCase.title,
      welfareId: newCase.createdBy,
      welfareAddress: newCase.welfareAddress
    });

    res.status(201).json(newCase);
  } catch (error) {
    console.error("Error adding case:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// ✅ GET all cases created by the logged-in welfare
router.get("/cases", verifyWelfareToken, async (req, res) => {
  try {
    const welfareId = req.user.id; // Get welfare ID from token
    const cases = await Case.find({ createdBy: welfareId })
      .populate('assignedDoctor', 'name specialization')
      .sort({ createdAt: -1 });
    res.status(200).json(cases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ GET latest cases for the public (no authentication required)
router.get("/cases/latest", async (req, res) => {
  try {
    // Find all cases, sort by creation date (newest first), and limit to 10
    const cases = await Case.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'name blockchainAddress')
      .populate('assignedDoctor', 'name specialization'); // Add doctor population
    
    // Add amountRaised field to each case (for now, it's a placeholder)
    // In a real app, this would come from donations
    const casesWithAmountRaised = cases.map(caseItem => {
      const caseObj = caseItem.toObject();
      // For now, we'll use a random amount between 0 and targetAmount
      // In a real app, this would be calculated from actual donations
      caseObj.amountRaised = Math.floor(Math.random() * caseObj.targetAmount);
      return caseObj;
    });
    
    res.status(200).json({
      success: true,
      cases: casesWithAmountRaised
    });
  } catch (error) {
    console.error("Error fetching latest cases:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ DELETE a case (Welfare deletes a case)
router.delete("/cases/:id", verifyWelfareToken, async (req, res) => {
  try {
    const welfareId = req.user.id; // Get logged-in welfare ID
    const caseId = req.params.id;

    // Find the case
    const caseToDelete = await Case.findOne({ _id: caseId, createdBy: welfareId });

    if (!caseToDelete) {
      return res.status(404).json({ message: "Case not found or unauthorized" });
    }

    // Delete the image from the server if it exists
    if (caseToDelete.imageUrl) {
      const imagePath = path.join(__dirname, "../uploads", caseToDelete.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the file
      }
    }

    // Delete the case from the database
    await Case.findByIdAndDelete(caseId);
    console.log("Case deleted:", caseId);

    res.status(200).json({ message: "Case deleted successfully" });
  } catch (error) {
    console.error("Error deleting case:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/profile", verifyWelfareToken, async (req, res) => {
  try {
    const welfareId = req.user.id;

    const welfare = await WelfareOrganization.findById(welfareId).select("-password"); // Exclude sensitive data

    if (!welfare) {
      return res.status(404).json({ message: "Welfare organization not found." });
    }

    res.status(200).json(welfare);
  } catch (error) {
    console.error("Error fetching welfare profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/profile/update", verifyWelfareToken, async (req, res) => {
  try {
    const welfareId = req.user.id;
    const updates = req.body;

    const updatedWelfare = await WelfareOrganization.findByIdAndUpdate(
      welfareId,
      {
        $set: {
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
          bio: updates.bio,
          "socialLinks.facebook": updates.socialLinks?.facebook || "",
          "socialLinks.instagram": updates.socialLinks?.instagram || "",
        },
      },
      { new: true }
    ).select("-password");

    if (!updatedWelfare) {
      return res.status(404).json({ message: "Welfare organization not found." });
    }

    res.status(200).json({ message: "Profile updated successfully!", welfare: updatedWelfare });
  } catch (error) {
    console.error("Error updating welfare profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/profile/upload", verifyWelfareToken, profilePicUpload.single("profilePic"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const imagePath = `/uploads/welfare_profile_pics/${req.file.filename}`;

    const updatedWelfare = await WelfareOrganization.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imagePath },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile picture updated successfully!",
      profilePicture: imagePath,
      welfare: updatedWelfare,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add success story/update to a case
router.post("/cases/:caseId/updates", verifyWelfareToken, upload.array("images"), async (req, res) => {
  try {
    const welfareId = req.user.id;
    const { caseId } = req.params;
    const { title, content } = req.body;

    // Verify the case exists and belongs to this welfare
    const existingCase = await Case.findOne({ _id: caseId, createdBy: welfareId });
    if (!existingCase) {
      return res.status(404).json({ message: "Case not found or you don't have permission to update it" });
    }

    // Collect the paths of all uploaded images
    const imagePaths = req.files.map(file => `cases/updates/${file.filename}`);

    // Create a new success story linked to this case
    const successStory = new SuccessStory({
      welfare: welfareId,
      title,
      content,
      images: imagePaths,
      relatedCase: caseId
    });

    await successStory.save();

    // Update the case to indicate it has updates
    existingCase.hasUpdates = true;
    await existingCase.save();

    res.status(201).json({
      message: "Case update posted successfully",
      successStory
    });
  } catch (error) {
    console.error("Error adding case update:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all updates/success stories for a specific case
router.get("/cases/:caseId/updates", async (req, res) => {
  try {
    const { caseId } = req.params;
    
    const updates = await SuccessStory.find({ relatedCase: caseId })
      .sort({ createdAt: -1 })
      .populate('welfare', 'name profilePicture');
    
    res.status(200).json(updates);
  } catch (error) {
    console.error("Error fetching case updates:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all success stories (for public viewing)
router.get("/success-stories", async (req, res) => {
  try {
    const successStories = await SuccessStory.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('welfare', 'name profilePicture')
      .populate('relatedCase', 'title');
    
    res.status(200).json(successStories);
  } catch (error) {
    console.error("Error fetching success stories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all updates by a specific welfare
router.get("/my-updates", verifyWelfareToken, async (req, res) => {
  try {
    const welfareId = req.user.id;
    
    const updates = await SuccessStory.find({ welfare: welfareId })
      .sort({ createdAt: -1 })
      .populate('relatedCase', 'title');
    
    res.status(200).json(updates);
  } catch (error) {
    console.error("Error fetching welfare updates:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Case Update Routes
// Create a case update
router.post("/case-updates", verifyWelfareToken, async (req, res) => {
    try {
        const { caseId, title, content, imageUrl, isSuccessStory } = req.body;
        
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
        
        const newUpdate = new CaseUpdate({
            caseId,
            title,
            content,
            imageUrl,
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

// Get all updates for a specific case (welfare org only)
router.get("/case-updates/:caseId", verifyWelfareToken, async (req, res) => {
    try {
        const { caseId } = req.params;
        
        // Verify the case exists and belongs to this welfare organization
        const existingCase = await Case.findOne({ 
            _id: caseId, 
            createdBy: req.welfare._id 
        });
        
        if (!existingCase) {
            return res.status(404).json({ 
                success: false, 
                message: "Case not found or you don't have permission to view updates" 
            });
        }
        
        const updates = await CaseUpdate.find({ caseId }).sort({ createdAt: -1 });
        
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

// Update a case update
router.put("/case-updates/:updateId", verifyWelfareToken, async (req, res) => {
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

// Delete a case update
router.delete("/case-updates/:updateId", verifyWelfareToken, async (req, res) => {
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

// GET public case updates by caseId
router.get('/public/case-updates/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    
    // Validate caseId format
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({ message: 'Invalid case ID format' });
    }
    
    // Find all published updates for the specific case
    const updates = await CaseUpdate.find({ 
      caseId: caseId,
      isPublished: true
    }).sort({ createdAt: -1 }).populate('postedBy', 'name');
    
    return res.status(200).json({ updates });
  } catch (error) {
    console.error('Error fetching case updates:', error);
    return res.status(500).json({ message: 'Error fetching case updates', error: error.message });
  }
});

// Public route to get all success stories
router.get("/public/success-stories", async (req, res) => {
    try {
        const successStories = await CaseUpdate.find({ 
            isSuccessStory: true,
            isPublished: true 
        })
        .sort({ createdAt: -1 })
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

// Get donations for the welfare organization dashboard
router.get("/donations", verifyWelfareToken, async (req, res) => {
  try {
    const welfareId = req.user.id;
    
    // Get all donations for this welfare organization
    const donations = await Donation.find({ welfare: welfareId })
      .populate('donor', 'name email')
      .populate('case', 'title')
      .sort({ createdAt: -1 });
    
    if (!donations || donations.length === 0) {
      return res.status(200).json({
        donations: [],
        stats: {
          total: 0,
          totalUsd: 0,
          thisMonth: 0,
          thisMonthUsd: 0,
          percentChange: 0,
          uniqueDonors: 0,
          newDonorsThisMonth: 0,
          donorPercentChange: 0
        },
        charts: {
          byMonth: [],
          byCase: []
        }
      });
    }
    
    // Process donations for statistics
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Calculate the first day of the current month
    const thisMonthStart = new Date(currentYear, currentMonth, 1);
    
    // Calculate the first day of the previous month
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    
    // Filter donations for this month and last month
    const thisMonthDonations = donations.filter(d => 
      new Date(d.createdAt) >= thisMonthStart
    );
    
    const previousMonthDonations = donations.filter(d => 
      new Date(d.createdAt) >= lastMonthStart && 
      new Date(d.createdAt) < thisMonthStart
    );
    
    // Calculate statistics
    let totalEth = 0;
    let totalUsd = 0;
    let thisMonthEth = 0;
    let thisMonthUsd = 0;
    
    // Get unique donors overall and this month
    const uniqueDonorIds = new Set();
    const thisMonthDonorIds = new Set();
    const previousMonthDonorIds = new Set();
    
    // Create a map for case-based donation aggregation
    const caseMap = new Map();
    
    // Create a map for monthly donations
    const monthlyMap = new Map();
    
    // Process all donations
    donations.forEach(donation => {
      const amount = parseFloat(donation.amount) || 0;
      const amountUsd = parseFloat(donation.amountUsd) || 0;
      
      totalEth += amount;
      totalUsd += amountUsd;
      
      // Track unique donor
      if (donation.donor && donation.donor._id) {
        uniqueDonorIds.add(donation.donor._id.toString());
      }
      
      // For this month's calculations
      const donationDate = new Date(donation.createdAt);
      if (donationDate >= thisMonthStart) {
        thisMonthEth += amount;
        thisMonthUsd += amountUsd;
        
        if (donation.donor && donation.donor._id) {
          thisMonthDonorIds.add(donation.donor._id.toString());
        }
      }
      
      // For previous month's calculations
      if (donationDate >= lastMonthStart && donationDate < thisMonthStart) {
        if (donation.donor && donation.donor._id) {
          previousMonthDonorIds.add(donation.donor._id.toString());
        }
      }
      
      // Track donations by case
      if (donation.case && donation.case.title) {
        const caseTitle = donation.case.title;
        caseMap.set(caseTitle, (caseMap.get(caseTitle) || 0) + 1);
      }
      
      // Track donations by month
      const monthYear = `${donationDate.toLocaleString('default', { month: 'short' })} ${donationDate.getFullYear()}`;
      monthlyMap.set(monthYear, (monthlyMap.get(monthYear) || 0) + amount);
    });
    
    // Calculate percent change from last month to this month
    const lastMonthTotal = previousMonthDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const percentChange = lastMonthTotal > 0 
      ? Math.round(((thisMonthEth - lastMonthTotal) / lastMonthTotal) * 100) 
      : (thisMonthEth > 0 ? 100 : 0);
    
    // Create array for donations chart by month (last 6 months)
    const monthlyDonations = [];
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleString('default', { month: 'short' }));
    }
    
    months.forEach(month => {
      // Find entries that match this month (ignoring year for simplicity)
      let monthTotal = 0;
      for (const [key, value] of monthlyMap.entries()) {
        if (key.startsWith(month)) {
          monthTotal += value;
        }
      }
      monthlyDonations.push({ month, amount: parseFloat(monthTotal.toFixed(4)) });
    });
    
    // Create array for case performance chart
    const casePerformance = [];
    for (const [name, donations] of caseMap.entries()) {
      // Truncate long case names for better display
      const displayName = name.length > 15 ? name.substring(0, 15) + '...' : name;
      casePerformance.push({ name: displayName, donations });
    }
    
    // Sort by donation count (descending)
    casePerformance.sort((a, b) => b.donations - a.donations);
    
    // Format donations for response
    const donationsResponse = donations.map(d => ({
      _id: d._id,
      donor: d.donor?.name || 'Anonymous',
      donorEmail: d.donor?.email || 'N/A',
      amount: parseFloat(d.amount) || 0,
      amountUsd: parseFloat(d.amountUsd) || 0,
      caseId: d.case?._id || '',
      caseTitle: d.case?.title || 'Unknown Case',
      transactionHash: d.txHash || '',
      date: d.createdAt
    }));
    
    // Send response
    res.status(200).json({
      donations: donationsResponse,
      stats: {
        total: parseFloat(totalEth.toFixed(4)),
        totalUsd: Math.round(totalUsd * 100) / 100,
        thisMonth: parseFloat(thisMonthEth.toFixed(4)),
        thisMonthUsd: Math.round(thisMonthUsd * 100) / 100,
        percentChange,
        uniqueDonors: uniqueDonorIds.size,
        newDonorsThisMonth: thisMonthDonorIds.size,
        donorPercentChange: previousMonthDonorIds.size > 0 
          ? Math.round(((thisMonthDonorIds.size - previousMonthDonorIds.size) / previousMonthDonorIds.size) * 100) 
          : (thisMonthDonorIds.size > 0 ? 100 : 0)
      },
      charts: {
        byMonth: monthlyDonations,
        byCase: casePerformance
      }
    });
  } catch (error) {
    console.error("Error fetching welfare donations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Function to send a thank you message to a donor
const sendThankYouMessage = async (welfareId, donorId, caseId, donationAmount) => {
  try {
    // Find the case details
    const caseDetails = await Case.findById(caseId);
    if (!caseDetails) {
      console.error("Case not found for thank you message");
      return false;
    }

    // Find the welfare organization details
    const welfare = await WelfareOrganization.findById(welfareId);
    if (!welfare) {
      console.error("Welfare organization not found for thank you message");
      return false;
    }

    // Create a thank you message
    const message = new Message({
      from: welfareId,
      to: donorId,
      title: `Thank you for your donation to ${caseDetails.title}!`,
      content: `Thank you for your generous donation of ${donationAmount} ETH to our case "${caseDetails.title}". Your support means the world to us and the animals we care for. We'll keep you updated on how your donation is making a difference.`,
      relatedCase: caseId,
      isRead: false
    });

    await message.save();
    return true;
  } catch (error) {
    console.error("Error sending thank you message:", error);
    return false;
  }
};

// New route - Process a new donation and send a thank you message
router.post("/process-donation", verifyWelfareToken, async (req, res) => {
  try {
    const { caseId, donorId, amount, txHash, amountUsd } = req.body;
    const welfareId = req.user.id;

    // Verify the case exists and belongs to this welfare
    const caseDetails = await Case.findOne({ _id: caseId, createdBy: welfareId });
    if (!caseDetails) {
      return res.status(404).json({ message: "Case not found or doesn't belong to this welfare organization" });
    }

    // Create a new donation record
    const donation = new Donation({
      donor: donorId,
      case: caseId,
      welfare: welfareId,
      amount,
      amountUsd,
      txHash,
      status: "Confirmed"
    });

    await donation.save();

    // Update the case's amountRaised
    await Case.findByIdAndUpdate(caseId, {
      $inc: { amountRaised: parseFloat(amountUsd) }
    });

    // Send a thank you message
    const messageSent = await sendThankYouMessage(welfareId, donorId, caseId, amount);

    res.status(201).json({ 
      message: "Donation processed successfully", 
      donation,
      thankYouMessageSent: messageSent
    });
  } catch (error) {
    console.error("Error processing donation:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// New route - Get all messages sent by a welfare organization
router.get("/messages", verifyWelfareToken, async (req, res) => {
  try {
    const welfareId = req.user.id;

    const messages = await Message.find({ from: welfareId })
      .populate('to', 'name email')
      .populate('relatedCase', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching welfare messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Public route to get all approved welfare organizations
router.get("/public/approved", async (req, res) => {
  try {
    const approvedWelfares = await WelfareOrganization.find({ status: 'approved' })
      .select('name description profilePicture address')
      .sort({ name: 1 });
    
    res.status(200).json(approvedWelfares);
  } catch (error) {
    console.error("Error fetching approved welfare organizations:", error);
    res.status(500).json({ 
      message: "Failed to fetch approved welfare organizations", 
      error: error.message 
    });
  }
});

// Update blockchain status
router.put("/blockchain-status", verifyWelfareToken, async (req, res) => {
  try {
    const welfareId = req.user.id;
    const { isRegistered, isActive } = req.body;

    const welfare = await WelfareOrganization.findById(welfareId);
    if (!welfare) {
      return res.status(404).json({ message: "Welfare organization not found" });
    }

    welfare.blockchainStatus.isRegistered = isRegistered;
    welfare.blockchainStatus.isActive = isActive;
    await welfare.save();

    res.status(200).json({ message: "Blockchain status updated successfully", welfare });
  } catch (error) {
    console.error("Error updating blockchain status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update blockchain address for welfare organization
router.put("/blockchain-address", verifyWelfareToken, async (req, res) => {
  try {
    const { blockchainAddress } = req.body;
    const welfareId = req.user.id;

    if (!blockchainAddress) {
      return res.status(400).json({ message: "Blockchain address is required" });
    }

    const updatedWelfare = await WelfareOrganization.findByIdAndUpdate(
      welfareId,
      { 
        blockchainAddress,
        "blockchainStatus.isRegistered": true,
        "blockchainStatus.isActive": true
      },
      { new: true }
    ).select("-password");

    if (!updatedWelfare) {
      return res.status(404).json({ message: "Welfare organization not found" });
    }

    res.status(200).json({ 
      message: "Blockchain address updated successfully",
      welfare: updatedWelfare
    });
  } catch (error) {
    console.error("Error updating blockchain address:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
