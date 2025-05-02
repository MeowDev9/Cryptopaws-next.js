const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
    // Reporter Information
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    
    // Animal & Emergency Details
    animalType: { type: String, required: true },
    condition: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    
    // Status tracking
    status: { 
        type: String, 
        enum: ['New', 'Assigned', 'In Progress', 'Resolved', 'Closed'], 
        default: 'New' 
    },
    
    // Assignment
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'WelfareOrganization' 
    },
    
    // Diagnosis and Treatment (added when a welfare responds)
    medicalIssue: { type: String },
    estimatedCost: { type: Number },
    treatmentPlan: { type: String },
    
    // Images
    images: [{
        type: String  // Store paths to uploaded images
    }],
    
    // Converted to case?
    convertedToCase: { type: Boolean, default: false },
    caseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Case' 
    },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Add an index on status for faster queries
emergencySchema.index({ status: 1 });
// Add an index on assignedTo for faster queries
emergencySchema.index({ assignedTo: 1 });

module.exports = mongoose.model("Emergency", emergencySchema);
