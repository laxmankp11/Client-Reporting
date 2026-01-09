const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema({
    description: { type: String, required: true },
    title: { type: String }, // Optional title, useful for Action Items
    type: { type: String, enum: ['log', 'action', 'report', 'observation'], default: 'log' },
    isStarred: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'responded', 'completed'], default: 'pending' },
    clientResponse: { type: String },
    date: { type: Date, default: Date.now },
    website: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
    developer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    attachments: [{ type: String }], // Array of file paths/URLs
    questions: [{
        text: { type: String, required: true },
        type: { type: String, enum: ['approval', 'multiple_choice', 'text'], required: true },
        options: [String], // For multiple_choice
        response: mongoose.Schema.Types.Mixed // String for text/approval, Array for multiple_choice
    }],
    durationMinutes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('WorkLog', workLogSchema);
