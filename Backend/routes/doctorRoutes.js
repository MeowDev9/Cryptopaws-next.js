const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Register a new doctor
router.post('/register', auth, async (req, res) => {
  try {
    const { name, email, password, specialization, welfareId } = req.body;

    // Check if doctor already exists
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new doctor
    doctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      specialization,
      welfareId
    });

    await doctor.save();

    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (error) {
    console.error('Error registering doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all doctors for a welfare organization
router.get('/welfare/:welfareId', auth, async (req, res) => {
  try {
    const doctors = await Doctor.find({ welfareId: req.params.welfareId })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, specialization } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update fields
    if (name) doctor.name = name;
    if (email) doctor.email = email;
    if (specialization) doctor.specialization = specialization;

    await doctor.save();
    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete doctor
router.delete('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await doctor.remove();
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign case to doctor
router.post('/:id/assign-case', auth, async (req, res) => {
  try {
    const { caseId } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!doctor.assignedCases.includes(caseId)) {
      doctor.assignedCases.push(caseId);
      await doctor.save();
    }

    res.json({ message: 'Case assigned successfully' });
  } catch (error) {
    console.error('Error assigning case:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove case from doctor
router.post('/:id/remove-case', auth, async (req, res) => {
  try {
    const { caseId } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.assignedCases = doctor.assignedCases.filter(
      id => id.toString() !== caseId
    );
    await doctor.save();

    res.json({ message: 'Case removed successfully' });
  } catch (error) {
    console.error('Error removing case:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 