const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const Case = require("../models/Case");
const WelfareOrganization = require("../models/WelfareOrganization");
const User = require("../models/User");
const Message = require("../models/Message");
const Donation = require("../models/Donation");
const axios = require("axios");
const SavedWelfare = require("../models/SavedWelfare");

// Get donation statistics for a donor
router.get("/donations/stats", auth, async (req, res) => {
  try {
    // Get the donor's ID from the authenticated user
    const donorId = req.user.id;

    // Get all donations made by this donor
    const donations = await Donation.find({ donor: donorId })
      .populate('welfare', 'name')
      .populate('case', 'targetAmount category');
    
    if (!donations || donations.length === 0) {
      return res.status(200).json({
        totalDonated: 0,
        casesSupported: 0,
        welfaresSupported: 0,
        monthlyChange: {
          donations: 0,
          cases: 0,
          welfares: 0
        },
        byWelfare: [],
        byCategory: []
      });
    }

    // Calculate total donated
    const totalDonated = donations.reduce((sum, donation) => sum + (donation.amountUsd || 0), 0);
    
    // Calculate unique cases and welfares
    const uniqueCases = new Set(donations.map(d => d.case?._id?.toString())).size;
    const uniqueWelfares = new Set(donations.map(d => d.welfare?._id?.toString())).size;
    
    // Calculate monthly change
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const recentDonations = donations.filter(d => new Date(d.createdAt) >= oneMonthAgo);
    const recentTotal = recentDonations.reduce((sum, donation) => sum + (donation.amountUsd || 0), 0);
    
    // Calculate monthly percentage change
    const monthlyPercentage = totalDonated > 0 ? Math.round((recentTotal / totalDonated) * 100) : 0;
    
    // Group by welfare
    const byWelfare = [];
    const welfareMap = new Map();
    
    donations.forEach(donation => {
      const welfareName = donation.welfare?.name || "Unknown";
      const amount = donation.amountUsd || 0;
      
      if (welfareMap.has(welfareName)) {
        welfareMap.set(welfareName, welfareMap.get(welfareName) + amount);
      } else {
        welfareMap.set(welfareName, amount);
      }
    });
    
    welfareMap.forEach((value, name) => {
      byWelfare.push({ name, value });
    });
    
    // Group by category
    const byCategory = [];
    const categoryMap = new Map();
    
    donations.forEach(donation => {
      const category = donation.case?.category || "Other";
      const amount = donation.amountUsd || 0;
      
      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category) + amount);
      } else {
        categoryMap.set(category, amount);
      }
    });
    
    categoryMap.forEach((value, name) => {
      byCategory.push({ name, value });
    });

    res.status(200).json({
      totalDonated,
      casesSupported: uniqueCases,
      welfaresSupported: uniqueWelfares,
      monthlyChange: {
        donations: monthlyPercentage,
        cases: recentDonations.filter(d => new Date(d.createdAt) >= oneMonthAgo).length,
        welfares: new Set(recentDonations.map(d => d.welfare?._id?.toString())).size
      },
      byWelfare,
      byCategory
    });
  } catch (error) {
    console.error("Error fetching donation stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get donation history for a donor
router.get("/donations/history", auth, async (req, res) => {
  try {
    // Get the donor's ID from the authenticated user
    const donorId = req.user.id;

    // Find all donations made by this donor
    const donations = await Donation.find({ donor: donorId })
      .populate('welfare', 'name')
      .populate('case', 'title')
      .sort({ createdAt: -1 });

    // Transform the donations to the expected format
    const donationHistory = donations.map(donation => ({
      _id: donation._id,
      welfare: donation.welfare || { name: "Unknown Welfare" },
      case: donation.case || { title: "Unknown Case" },
      amount: donation.amount,
      amountUsd: donation.amountUsd,
      createdAt: donation.createdAt,
      status: donation.status || "Confirmed",
      txHash: donation.txHash || "0x0"
    }));

    res.status(200).json(donationHistory);
  } catch (error) {
    console.error("Error fetching donation history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get saved welfares for a donor
router.get("/saved-welfares", auth, async (req, res) => {
  try {
    // Get the donor's ID from the authenticated user
    const donorId = req.user.id;

    // Find all saved welfares for this donor
    const savedWelfares = await SavedWelfare.find({ donor: donorId })
      .populate('welfare', 'name description profilePicture');

    // Transform the data to the expected format
    const transformedWelfares = savedWelfares.map(saved => ({
      _id: saved.welfare._id,
      name: saved.welfare.name,
      description: saved.welfare.description || "No description available",
      profileImage: saved.welfare.profilePicture || "/images/placeholder.jpg"
    }));

    res.status(200).json(transformedWelfares);
  } catch (error) {
    console.error("Error fetching saved welfares:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save a welfare organization
router.post("/save-welfare", auth, async (req, res) => {
  try {
    const { welfareId } = req.body;
    const donorId = req.user.id;

    if (!welfareId) {
      return res.status(400).json({ message: "Welfare ID is required" });
    }

    // Check if this welfare is already saved
    const existingSave = await SavedWelfare.findOne({ donor: donorId, welfare: welfareId });
    if (existingSave) {
      return res.status(400).json({ message: "Welfare organization already saved" });
    }

    // Create a new saved welfare entry
    const savedWelfare = new SavedWelfare({
      donor: donorId,
      welfare: welfareId
    });

    await savedWelfare.save();
    res.status(200).json({ message: "Welfare organization saved successfully" });
  } catch (error) {
    console.error("Error saving welfare:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unsave a welfare organization
router.delete("/unsave-welfare/:id", auth, async (req, res) => {
  try {
    const welfareId = req.params.id;
    const donorId = req.user.id;

    if (!welfareId) {
      return res.status(400).json({ message: "Welfare ID is required" });
    }

    // Find and delete the saved welfare entry
    const result = await SavedWelfare.findOneAndDelete({ donor: donorId, welfare: welfareId });
    
    if (!result) {
      return res.status(404).json({ message: "Saved welfare not found" });
    }

    res.status(200).json({ message: "Welfare organization removed from saved list" });
  } catch (error) {
    console.error("Error unsaving welfare:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new donation and trigger thank you message
router.post("/donate", auth, async (req, res) => {
  try {
    const { caseId, welfareId, amount, txHash, amountUsd, blockchainData } = req.body;
    const donorId = req.user.id;

    // Create a new donation record
    const donation = new Donation({
      donor: donorId,
      case: caseId,
      welfare: welfareId,
      amount,
      amountUsd,
      txHash,
      status: "Confirmed",
      blockchainData
    });

    await donation.save();

    // Update the case's amountRaised
    await Case.findByIdAndUpdate(caseId, {
      $inc: { amountRaised: parseFloat(amountUsd) }
    });

    // Notify the welfare organization about the donation
    try {
      // Make a request to the welfare route to process the donation and send thank you
      const welfareResponse = await axios.post(
        `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/welfare/process-donation`,
        {
          donorId,
          caseId,
          amount,
          txHash,
          amountUsd
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': req.header('x-auth-token')
          }
        }
      );

      res.status(201).json({
        message: "Donation created successfully",
        donation,
        welfareNotified: welfareResponse.data.thankYouMessageSent
      });
    } catch (error) {
      // Still return success for the donation but note that welfare notification failed
      console.error("Error notifying welfare organization:", error);
      res.status(201).json({
        message: "Donation created successfully, but failed to notify welfare organization",
        donation,
        welfareNotified: false
      });
    }
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all messages for a donor
router.get("/messages", auth, async (req, res) => {
  try {
    const donorId = req.user.id;

    const messages = await Message.find({ to: donorId })
      .populate('from', 'name profileImage')
      .populate('relatedCase', 'title imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching donor messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark a message as read
router.put("/messages/:messageId/read", auth, async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const donorId = req.user.id;

    const message = await Message.findOne({ _id: messageId, to: donorId });
    if (!message) {
      return res.status(404).json({ message: "Message not found or not addressed to this donor" });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new endpoint for welfare organizations to fetch their donations
router.get("/donations/welfare", auth, async (req, res) => {
  try {
    // Verify the user is a welfare organization
    if (req.user.role !== 'welfare') {
      return res.status(403).json({ message: "Access denied. Only welfare organizations can view this data" });
    }

    const welfareId = req.user.id;

    // Get all donations made to this welfare's cases
    const donations = await Donation.find({ welfare: welfareId })
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

    // Get donors from User model
    const donorIds = [...new Set(donations.map(d => d.donor))];
    const donors = await User.find({ _id: { $in: donorIds } }, 'name');
    
    // Map donor IDs to names
    const donorMap = {};
    donors.forEach(donor => {
      donorMap[donor._id.toString()] = donor.name;
    });

    // Calculate total donated amounts
    const totalEth = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    const totalUsd = donations.reduce((sum, donation) => sum + (donation.amountUsd || 0), 0);
    
    // Calculate this month's donations
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const recentDonations = donations.filter(d => new Date(d.createdAt) >= oneMonthAgo);
    const thisMonthEth = recentDonations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    const thisMonthUsd = recentDonations.reduce((sum, donation) => sum + (donation.amountUsd || 0), 0);
    
    // Calculate percentage change
    const previousMonthStart = new Date(oneMonthAgo);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    
    const previousMonthDonations = donations.filter(d => 
      new Date(d.createdAt) >= previousMonthStart && new Date(d.createdAt) < oneMonthAgo
    );
    
    const previousMonthUsd = previousMonthDonations.reduce((sum, donation) => sum + (donation.amountUsd || 0), 0);
    
    // Calculate percentage change (avoid division by zero)
    let percentChange = 0;
    if (previousMonthUsd > 0) {
      percentChange = Math.round(((thisMonthUsd - previousMonthUsd) / previousMonthUsd) * 100);
    } else if (thisMonthUsd > 0) {
      percentChange = 100; // If previous month was 0 and this month has donations, that's a 100% increase
    }
    
    // Count unique donors
    const uniqueDonors = new Set(donations.map(d => d.donor.toString())).size;
    const newDonorsThisMonth = new Set(recentDonations.map(d => d.donor.toString())).size;
    
    // Prepare donations for response
    const donationsResponse = donations.map(donation => ({
      _id: donation._id,
      donor: donorMap[donation.donor.toString()] || "Anonymous Donor",
      donorAddress: donation.donorAddress || "0x0000...",
      amount: donation.amount || 0,
      amountUsd: donation.amountUsd || 0,
      caseId: donation.case?._id || "",
      caseTitle: donation.case?.title || "Unknown Case",
      transactionHash: donation.txHash || "",
      date: donation.createdAt
    }));
    
    // Group donations by month for chart
    const monthlyDonations = [];
    const monthMap = new Map();
    
    donations.forEach(donation => {
      const date = new Date(donation.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const amount = donation.amountUsd || 0;
      
      if (monthMap.has(monthYear)) {
        monthMap.set(monthYear, monthMap.get(monthYear) + amount);
      } else {
        monthMap.set(monthYear, amount);
      }
    });
    
    // Convert to array and sort by date
    for (const [month, amount] of monthMap.entries()) {
      monthlyDonations.push({ month, amount });
    }
    
    // Sort by date (assuming month-year format)
    monthlyDonations.sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA - dateB;
    });
    
    // Group donations by case for chart
    const caseMap = new Map();
    donations.forEach(donation => {
      const caseName = donation.case?.title || "Unknown Case";
      
      if (caseMap.has(caseName)) {
        caseMap.set(caseName, caseMap.get(caseName) + 1);
      } else {
        caseMap.set(caseName, 1);
      }
    });
    
    const casePerformance = [];
    for (const [name, donations] of caseMap.entries()) {
      // Truncate long case names for better display
      const displayName = name.length > 15 ? name.substring(0, 15) + '...' : name;
      casePerformance.push({ name: displayName, donations });
    }
    
    // Sort by donation count (descending)
    casePerformance.sort((a, b) => b.donations - a.donations);
    
    res.status(200).json({
      donations: donationsResponse,
      stats: {
        total: parseFloat(totalEth.toFixed(4)),
        totalUsd: Math.round(totalUsd * 100) / 100,
        thisMonth: parseFloat(thisMonthEth.toFixed(4)),
        thisMonthUsd: Math.round(thisMonthUsd * 100) / 100,
        percentChange,
        uniqueDonors,
        newDonorsThisMonth,
        donorPercentChange: previousMonthDonations.length > 0 
          ? Math.round(((newDonorsThisMonth - previousMonthDonations.length) / previousMonthDonations.length) * 100) 
          : (newDonorsThisMonth > 0 ? 100 : 0)
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

module.exports = router; 