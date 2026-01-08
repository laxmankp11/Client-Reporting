const mongoose = require('mongoose');

const dailyStatSchema = new mongoose.Schema({
    website: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
    date: { type: Date, required: true }, // Normalized to midnight UTC
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure one entry per website per day
dailyStatSchema.index({ website: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyStat', dailyStatSchema);
