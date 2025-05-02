const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    targetAmount: {
        type: Number,
        required: true,
    },
    amountRaised: {
        type: Number,
        default: 0,
    },
    imageUrl: {
        type: [String],  // Changed to an array of strings to store multiple image URLs
        required: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WelfareOrganization',
        required: true,
    },
    welfareAddress: {  // Added field for welfare's blockchain address
        type: String,
        required: false,  // Not required at creation time as it might be connected later
    },
    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: false,
    },
    medicalIssue: {
        type: String,
        required: false,
    },
    costBreakdown: [{
        item: { type: String },
        cost: { type: Number }
    }],
    hasUpdates: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'closed'],
        default: 'active',
    },
}, { timestamps: true });

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
