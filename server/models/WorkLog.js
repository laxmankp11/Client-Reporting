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
    durationMinutes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('WorkLog', workLogSchema);
