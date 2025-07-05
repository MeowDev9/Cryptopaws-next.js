const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Case = require('../models/Case');
const { sendTempPasswordEmail } = require('../utils/emailService');

// Register a new doctor (legacy endpoint)
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

// Register a new doctor with temporary password
router.post('/register-with-temp-password', auth, async (req, res) => {
  try {
    const { name, email, specialization, welfareId } = req.body;

    // Check if doctor already exists
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Hash the temporary password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create new doctor
    doctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      specialization,
      welfareId,
      passwordReset: true // Flag to indicate password needs to be reset on first login
    });

    await doctor.save();
    
    // Send email with temporary password using Gmail
    const emailResult = await sendTempPasswordEmail(email, name, tempPassword);
    
    console.log(`Temporary password email sent to ${email}`);
    
    
    // Return success response without exposing the temporary password in the response
    res.status(201).json({ 
      message: 'Doctor registered successfully. A temporary password has been sent to their email.',
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        welfareId: doctor.welfareId,
        createdAt: doctor.createdAt
      }
    });
  } catch (error) {
    console.error('Error registering doctor with temporary password:', error);
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

// Get current doctor profile - MUST BE DEFINED BEFORE /:id ROUTE
router.get('/profile', auth, async (req, res) => {
  try {
    // Enhanced debugging for token issues
    console.log('Doctor profile request - START');
    console.log('Doctor profile request - Headers:', req.headers);
    console.log('Doctor profile request - Auth header:', req.header('Authorization'));
    
    // Decode token for debugging
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('Doctor profile request - Token payload:', {
            id: payload.id,
            role: payload.role,
            exp: payload.exp,
            expDate: new Date(payload.exp * 1000).toISOString(),
            now: new Date().toISOString(),
            diff: (payload.exp * 1000) - Date.now()
          });
        }
      } catch (decodeError) {
        console.error('Doctor profile request - Error decoding token:', decodeError);
      }
    }
    
    console.log('Doctor profile request - req.user:', req.user);
    const doctor = await Doctor.findById(req.user.id).select('-password');
    if (!doctor) {
      console.error('Doctor not found for id:', req.user.id);
      return res.status(404).json({ message: 'Doctor not found' });
    }
    if (doctor.isActive === false || doctor.status === 'inactive' || doctor.status === 'pending') {
      console.warn('Doctor is not active:', doctor._id, doctor.status);
      return res.status(403).json({ message: 'Doctor account is not active or approved.' });
    }
    console.log('Doctor profile request - SUCCESS');
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error, 'req.user:', req.user);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update doctor profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, specialization, currentPassword, newPassword } = req.body;
    
    // Find the doctor by ID
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Update basic profile information
    if (name) doctor.name = name;
    if (email) doctor.email = email;
    if (specialization) doctor.specialization = specialization;
    
    // If changing password
    if (currentPassword && newPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, doctor.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash and set new password
      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(newPassword, salt);
      
      // If this was a temporary password, mark that it's been reset
      if (doctor.passwordReset) {
        doctor.passwordReset = false;
      }
    }
    
    await doctor.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor by ID - WITH SPECIAL HANDLING FOR NON-OBJECTID VALUES
router.get('/:id', auth, async (req, res) => {
  try {
    // Skip this route for special routes that should be handled by their own handlers
    if (req.params.id === 'profile' || req.params.id === 'cases' || req.params.id === 'welfare') {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
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
    // Check if the ID is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
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
    // Check if the ID is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Use deleteOne instead of remove (which is deprecated)
    await Doctor.deleteOne({ _id: req.params.id });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign case to doctor
router.post('/:id/assign-case', auth, async (req, res) => {
  try {
    // Check if the ID is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
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

// Doctor login
router.post('/login', async (req, res) => {
  try {
    console.log('Doctor login attempt - START');
    const { email, password } = req.body;
    console.log('Doctor login attempt - Email:', email);
    
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      console.log('Doctor login attempt - Doctor not found for email:', email);
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    console.log('Doctor login attempt - Doctor found:', doctor._id);
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      console.log('Doctor login attempt - Invalid password for doctor:', doctor._id);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('Doctor login attempt - Password verified for doctor:', doctor._id);
    
    // Generate token with debugging
    const payload = { id: doctor._id, role: 'doctor' };
    console.log('Doctor login attempt - Token payload:', payload);
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Decode token to verify it was created correctly
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const decodedPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('Doctor login attempt - Generated token payload:', {
          id: decodedPayload.id,
          role: decodedPayload.role,
          exp: decodedPayload.exp,
          expDate: new Date(decodedPayload.exp * 1000).toISOString(),
          now: new Date().toISOString(),
          diff: (decodedPayload.exp * 1000) - Date.now()
        });
      }
    } catch (decodeError) {
      console.error('Doctor login attempt - Error decoding generated token:', decodeError);
    }
    
    console.log('Doctor login attempt - SUCCESS');
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
    const { medicalIssue, costBreakdown, status, isUrgent } = req.body;

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
    if (isUrgent !== undefined) caseToUpdate.isUrgent = isUrgent;

    await caseToUpdate.save();
    res.json({ message: 'Case updated successfully', case: caseToUpdate });
  } catch (error) {
    console.error('Error updating case diagnosis:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 