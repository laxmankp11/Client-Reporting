const Website = require('../models/Website');

// @desc    Create a website
// @route   POST /api/websites
// @access  Private/Admin
const createWebsite = async (req, res) => {
    const { name, url, client, developers } = req.body;

    try {
        const website = await Website.create({
            name,
            url,
            client,
            developers
        });
        res.status(201).json(website);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all websites (Admin sees all, Client sees theirs, Dev sees assigned)
// @route   GET /api/websites
// @access  Private
const getWebsites = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'client') {
            query = { client: req.user._id };
        } else if (req.user.role === 'developer') {
            query = { developers: req.user._id };
        }
        // Admin sees all (empty query)

        const websites = await Website.find(query)
            .populate('client', 'name email')
            .populate('developers', 'name email');

        res.json(websites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update a website
// @route   PUT /api/websites/:id
// @access  Private/Admin
const updateWebsite = async (req, res) => {
    try {
        const website = await Website.findById(req.params.id);

        if (website) {
            website.name = req.body.name || website.name;
            website.url = req.body.url || website.url;
            website.client = req.body.client || website.client;
            website.developers = req.body.developers || website.developers;

            // Allow updating GSC and Config if passed
            website.gscPropertyUrl = req.body.gscPropertyUrl || website.gscPropertyUrl;
            website.config = req.body.config || website.config;

            const updatedWebsite = await website.save();
            res.json(updatedWebsite);
        } else {
            res.status(404).json({ message: 'Website not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a website
// @route   DELETE /api/websites/:id
// @access  Private/Admin
// @desc    Update hosting details (Admin or Client Owner)
// @route   PUT /api/websites/:id/hosting
// @access  Private
const updateHostingDetails = async (req, res) => {
    try {
        const website = await Website.findById(req.params.id);

        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin') {
            // If not admin, must be the client owner
            if (website.client && website.client.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update hosting details' });
            }
        }

        website.hostingDetails = {
            provider: req.body.provider || website.hostingDetails?.provider,
            domain: req.body.domain || website.hostingDetails?.domain,
            ftpHost: req.body.ftpHost || website.hostingDetails?.ftpHost,
            ftpUser: req.body.ftpUser || website.hostingDetails?.ftpUser,
            ftpPassword: req.body.ftpPassword || website.hostingDetails?.ftpPassword
        };

        const updatedWebsite = await website.save();
        res.json(updatedWebsite);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteWebsite = async (req, res) => {
    try {
        const website = await Website.findById(req.params.id);

        if (website) {
            await website.deleteOne();
            res.json({ message: 'Website removed' });
        } else {
            res.status(404).json({ message: 'Website not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createWebsite, getWebsites, updateWebsite, deleteWebsite, updateHostingDetails };
