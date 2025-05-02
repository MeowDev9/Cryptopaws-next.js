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
    }
}, { timestamps: true });

const CaseUpdate = mongoose.model('CaseUpdate', caseUpdateSchema);

module.exports = CaseUpdate; 