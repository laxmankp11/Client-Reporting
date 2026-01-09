const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    website: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Competitor', competitorSchema);
