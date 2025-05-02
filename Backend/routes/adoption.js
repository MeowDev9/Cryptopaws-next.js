const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoptionController');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/adoptions/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Get all adoptions
router.get('/all', adoptionController.getAllAdoptions);

// Get a single adoption by ID
router.get('/:id', adoptionController.getAdoptionById);

// Create new adoption listing
router.post('/', auth, upload.array('images', 5), adoptionController.createAdoption);

// Process adoption request
router.post('/:id/adopt', auth, adoptionController.processAdoption);

module.exports = router; 