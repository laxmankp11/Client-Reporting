const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    developers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    gscPropertyUrl: { type: String }, // URL as defined in Google Search Console
    googleCredentials: { type: Object, select: false }, // Optional: JSON Service Account for this specific website
    seoHealthScore: { type: Number, default: 0 },
    seoData: {
        title: String,
        description: String,
        h1: [String],
        ogTitle: String,
        ogImage: String,
        loadTime: Number
    },
    lastSeoScan: { type: Date },
    config: { type: Object, default: {} },
    hostingDetails: {
        provider: String,
        domain: String,
        ftpHost: String,
        ftpUser: String,
        ftpPassword: { type: String, select: true } // Storing plain for now as requested
    }
}, { timestamps: true });

module.exports = mongoose.model('Website', websiteSchema);
