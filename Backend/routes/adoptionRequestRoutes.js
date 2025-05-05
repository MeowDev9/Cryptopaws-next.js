const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adoptionRequestController = require('../controllers/adoptionRequestController');
const multer = require('multer');
const path = require('path');
const Message = require('../models/Message');
const AdoptionRequest = require('../models/AdoptionRequest');
const Adoption = require('../models/Adoption');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/payment-proofs/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create a new adoption request
router.post('/', auth, adoptionRequestController.createRequest);

// Get all requests for a specific adoption (for welfare)
router.get('/adoption/:adoptionId', auth, adoptionRequestController.getRequestsForAdoption);

// Get all requests by the logged-in donor
router.get('/my', auth, adoptionRequestController.getMyRequests);

// Get all requests for welfare's adoptions
router.get('/welfare', auth, adoptionRequestController.getWelfareRequests);

// Update request status
router.patch('/:requestId', auth, adoptionRequestController.updateRequestStatus);

// Add new route for payment proof upload
router.post('/:requestId/payment-proof', auth, upload.single('paymentProof'), async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const paymentProof = req.file ? req.file.path : null;

    if (!paymentProof) {
      return res.status(400).json({ message: 'No payment proof file uploaded' });
    }

    const request = await AdoptionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Adoption request not found' });
    }

    // Check if the request belongs to the donor
    if (request.donorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    // Update the request with payment proof and change status
    request.paymentProof = paymentProof;
    request.status = 'under review';
    await request.save();

    res.json({ message: 'Payment proof uploaded successfully', request });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({ message: 'Error uploading payment proof', error: error.message });
  }
});

// Add new route for adoption payment
router.post('/:requestId/payment', auth, async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const { fromAddress, amount } = req.body;

    const request = await AdoptionRequest.findById(requestId).populate('adoptionId');
    if (!request) {
      return res.status(404).json({ message: 'Adoption request not found' });
    }

    // Check if the request belongs to the donor
    if (request.donorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to make payment for this request' });
    }

    // Verify the payment amount (30 USDT worth of ETH)
    const expectedAmount = 30; // In USDT
    if (amount < expectedAmount) {
      return res.status(400).json({ message: 'Payment amount is less than required' });
    }

    // Update the request with payment details
    request.paymentProof = fromAddress; // Store the sender's address as proof
    request.status = 'under review';
    await request.save();

    // Notify the welfare organization
    const message = new Message({
      from: request.adoptionId.postedBy,
      to: request.donorId,
      title: 'Payment Received',
      content: `Payment of ${amount} USDT has been received from address ${fromAddress} for the adoption of ${request.adoptionId.name}. The payment is being verified.`,
      isRead: false
    });
    await message.save();

    res.json({ message: 'Payment received and being verified', request });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

// Add new route for payment verification
router.post('/:requestId/verify-payment', auth, async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const { verified } = req.body;

    const request = await AdoptionRequest.findById(requestId).populate('adoptionId');
    if (!request) {
      return res.status(404).json({ message: 'Adoption request not found' });
    }

    // Check if the request belongs to the welfare organization
    if (request.adoptionId.postedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to verify this payment' });
    }

    if (verified) {
      // Update the request status
      request.status = 'completed';
      await request.save();

      // Update the adoption status
      request.adoptionId.status = 'adopted';
      request.adoptionId.adoptedBy = request.donorId;
      await request.adoptionId.save();

      // Notify the donor
      const message = new Message({
        from: req.user.id,
        to: request.donorId,
        title: 'Payment Verified',
        content: `Your payment for adopting ${request.adoptionId.name} has been verified. The adoption process is now complete. Please contact the welfare organization to arrange the pickup.`,
        isRead: false
      });
      await message.save();
    } else {
      request.status = 'payment pending';
      await request.save();

      // Notify the donor
      const message = new Message({
        from: req.user.id,
        to: request.donorId,
        title: 'Payment Rejected',
        content: `Your payment for adopting ${request.adoptionId.name} was rejected. Please try making the payment again.`,
        isRead: false
      });
      await message.save();
    }

    res.json({ message: `Payment ${verified ? 'verified' : 'rejected'} successfully`, request });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
});

module.exports = router; 