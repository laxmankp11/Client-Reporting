const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'GOOGLE_SERVICE_ACCOUNT'
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be object, string, etc.
    description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
