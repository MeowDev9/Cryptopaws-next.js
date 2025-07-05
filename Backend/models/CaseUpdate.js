const mongoose = require('mongoose');

const caseUpdateSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: [String],
        required: false
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WelfareOrganization',
        required: true
    },
    isSuccessStory: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    spent: {
        surgery: { type: Number, default: 0 },
        medicine: { type: Number, default: 0 },
        recovery: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    authorRole: {
        type: String,
        enum: ['doctor', 'welfare'],
        required: true
    },
    animalStatus: {
        type: String,
        required: false
    },
    // Track which donors have seen this update
    seenBy: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donor'
        }],
        default: []
    }
}, { timestamps: true });

const CaseUpdate = mongoose.model('CaseUpdate', caseUpdateSchema);

module.exports = CaseUpdate; 