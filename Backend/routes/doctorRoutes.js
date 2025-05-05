const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Case = require('../models/Case');

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

// Get cases assigned to a doctor
router.get('/cases', auth, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const cases = await Case.find({ assignedDoctor: doctorId })
      .select('-__v')
      .populate('createdBy', 'name');
    res.json(cases);
  } catch (error) {
    console.error('Error fetching doctor cases:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current doctor profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Doctor profile request. req.user:', req.user);
    const doctor = await Doctor.findById(req.user.id).select('-password');
    if (!doctor) {
      console.error('Doctor not found for id:', req.user.id);
      return res.status(404).json({ message: 'Doctor not found' });
    }
    if (doctor.isActive === false || doctor.status === 'inactive' || doctor.status === 'pending') {
      console.warn('Doctor is not active:', doctor._id, doctor.status);
      return res.status(403).json({ message: 'Doctor account is not active or approved.' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error, 'req.user:', req.user);
    res.status(500).json({ message: 'Server error', error: error.message });
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

// Doctor Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, specialization, password } = req.body;
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    if (name) doctor.name = name;
    if (email) doctor.email = email;
    if (specialization) doctor.specialization = specialization;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(password, salt);
    }
    await doctor.save();
    res.json({ message: 'Profile updated successfully', doctor });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor updates diagnosis and cost breakdown for an assigned case
router.put('/cases/:caseId/diagnosis', auth, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { caseId } = req.params;
    const { medicalIssue, costBreakdown, status } = req.body;

    // Find the case and ensure this doctor is assigned
    const caseToUpdate = await Case.findById(caseId);
    if (!caseToUpdate) {
      return res.status(404).json({ message: 'Case not found' });
    }
    if (!caseToUpdate.assignedDoctor || caseToUpdate.assignedDoctor.toString() !== doctorId) {
      return res.status(403).json({ message: 'You are not assigned to this case' });
    }

    // Update fields
    if (medicalIssue !== undefined) caseToUpdate.medicalIssue = medicalIssue;
    if (costBreakdown !== undefined) caseToUpdate.costBreakdown = costBreakdown;
    if (status !== undefined) caseToUpdate.status = status;

    await caseToUpdate.save();
    res.json({ message: 'Case updated successfully', case: caseToUpdate });
  } catch (error) {
    console.error('Error updating case diagnosis:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 