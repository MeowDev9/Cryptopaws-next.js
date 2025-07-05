const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const WelfareOrganization = require('../models/WelfareOrganization');

// Update blockchain status
router.put('/blockchain-status', auth, async (req, res) => {
  try {
    const { isRegistered, isActive, blockchainTxHash } = req.body;
    
    // Find the welfare organization by the authenticated user's ID
    const welfare = await WelfareOrganization.findOne({ _id: req.user.id });
    
    if (!welfare) {
      return res.status(404).json({ message: 'Welfare organization not found' });
    }
    
    // Update the blockchain status
    welfare.blockchainStatus.isRegistered = isRegistered;
    welfare.blockchainStatus.isActive = isActive;
    welfare.blockchainTxHash = blockchainTxHash;
    
    await welfare.save();
    
    res.json({ message: 'Blockchain status updated successfully' });
  } catch (error) {
    console.error('Error updating blockchain status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update blockchain address
router.put('/blockchain-address', auth, async (req, res) => {
  try {
    const { blockchainAddress } = req.body;
    
    if (!blockchainAddress) {
      return res.status(400).json({ message: 'Blockchain address is required' });
    }
    
    // Find the welfare organization by the authenticated user's ID
    const welfare = await WelfareOrganization.findOne({ _id: req.user.id });
    
    if (!welfare) {
      return res.status(404).json({ message: 'Welfare organization not found' });
    }
    
    // Update the blockchain address
    welfare.blockchainAddress = blockchainAddress;
    
    await welfare.save();
    
    res.json({ message: 'Blockchain address updated successfully' });
  } catch (error) {
    console.error('Error updating blockchain address:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new welfare organization
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      description,
      website,
      blockchainAddress,
      blockchainTxHash
    } = req.body;

    // Check if welfare organization already exists
    let welfare = await WelfareOrganization.findOne({ email });
    if (welfare) {
      return res.status(400).json({ message: 'Welfare organization already exists' });
    }

    // Create new welfare organization
    welfare = new WelfareOrganization({
      name,
      email,
      password,
      phone,
      address,
      description,
      website: website || '',
      blockchainAddress: blockchainAddress || null,
      blockchainTxHash: blockchainTxHash || null,
      blockchainStatus: {
        isRegistered: false,
        isActive: false,
        totalDonations: "0",
        uniqueDonors: 0
      }
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    welfare.password = await bcrypt.hash(password, salt);

    await welfare.save();

    // Create JWT token
    const payload = {
      user: {
        id: welfare.id,
        role: 'welfare'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 