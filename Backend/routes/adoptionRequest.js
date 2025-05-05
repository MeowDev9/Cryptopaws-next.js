const express = require('express');
const router = express.Router();
const adoptionRequestController = require('../controllers/adoptionRequestController');
const auth = require('../middleware/auth'); // General auth middleware for donor authentication

console.log('Setting up adoption request routes...');

// Create a new adoption request (donor)
router.post('/', auth, adoptionRequestController.createRequest);

// Get all requests for a specific adoption (welfare)
router.get('/adoption/:adoptionId', auth, adoptionRequestController.getRequestsForAdoption);

// Get all requests by the logged-in donor
router.get('/my', auth, adoptionRequestController.getMyRequests);

// Get all requests for welfare's adoptions
router.get('/welfare', auth, (req, res, next) => {
  console.log('Welfare requests route hit');
  next();
}, adoptionRequestController.getWelfareRequests);

// Update request status (welfare)
router.patch('/:requestId', auth, adoptionRequestController.updateRequestStatus);

console.log('Adoption request routes setup complete');

module.exports = router; 