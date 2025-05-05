const Adoption = require('../models/Adoption');
const Welfare = require('../models/WelfareOrganization');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all adoptions
exports.getAllAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(adoptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching adoptions', error: error.message });
  }
};

// Get a single adoption by ID
exports.getAdoptionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid adoption ID format' });
    }

    const adoption = await Adoption.findById(id);

    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    res.status(200).json(adoption);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching adoption', error: error.message });
  }
};

// Get adoptions by welfare organization
exports.getAdoptionsByWelfare = async (req, res) => {
  try {
    const adoptions = await Adoption.find({ postedBy: req.params.welfareId })
      .populate('postedBy', 'name')
      .populate('adoptedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(adoptions);
  } catch (error) {
    console.error('Error fetching welfare adoptions:', error);
    res.status(500).json({ message: 'Error fetching welfare adoptions' });
  }
};

// Create new adoption listing
exports.createAdoption = async (req, res) => {
  try {
    const {
      name,
      type,
      breed,
      age,
      gender,
      size,
      description,
      location,
      health,
      behavior,
      postedByType
    } = req.body;

    const images = req.files ? req.files.map(file => file.path) : [];

    // Validate postedByType
    if (!['User', 'WelfareOrganization'].includes(postedByType)) {
      return res.status(400).json({ message: 'Invalid postedByType' });
    }

    const newAdoption = new Adoption({
      name,
      type,
      breed,
      age,
      gender,
      size,
      description,
      images,
      location,
      health,
      behavior,
      postedBy: req.user.id,
      postedByType
    });

    await newAdoption.save();
    res.status(201).json(newAdoption);
  } catch (error) {
    console.error('Error creating adoption:', error);
    res.status(500).json({ message: 'Error creating adoption' });
  }
};

// Update adoption listing
exports.updateAdoption = async (req, res) => {
  try {
    const {
      name,
      type,
      breed,
      age,
      gender,
      size,
      description,
      location,
      health,
      behavior,
      status
    } = req.body;

    const images = req.files ? req.files.map(file => file.path) : [];

    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    // Update fields
    adoption.name = name || adoption.name;
    adoption.type = type || adoption.type;
    adoption.breed = breed || adoption.breed;
    adoption.age = age || adoption.age;
    adoption.gender = gender || adoption.gender;
    adoption.size = size || adoption.size;
    adoption.description = description || adoption.description;
    adoption.location = location || adoption.location;
    adoption.health = health || adoption.health;
    adoption.behavior = behavior || adoption.behavior;
    adoption.status = status || adoption.status;
    
    // Add new images if any
    if (images.length > 0) {
      adoption.images = [...adoption.images, ...images];
    }

    await adoption.save();
    res.json(adoption);
  } catch (error) {
    console.error('Error updating adoption:', error);
    res.status(500).json({ message: 'Error updating adoption' });
  }
};

// Delete adoption listing
exports.deleteAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    await adoption.remove();
    res.json({ message: 'Adoption deleted successfully' });
  } catch (error) {
    console.error('Error deleting adoption:', error);
    res.status(500).json({ message: 'Error deleting adoption' });
  }
};

// Process adoption request
exports.processAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    adoption.status = 'adopted';
    adoption.adoptedBy = req.body.adoptedBy; // Use the donorId from the request body

    await adoption.save();
    res.json(adoption);
  } catch (error) {
    console.error('Error processing adoption:', error);
    res.status(500).json({ message: 'Error processing adoption' });
  }
}; 