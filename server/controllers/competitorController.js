const Competitor = require('../models/Competitor');
const Website = require('../models/Website');

// @desc    Get competitors for a website
// @route   GET /api/competitors
// @access  Private
const getCompetitors = async (req, res) => {
    try {
        const { websiteId } = req.query;
        if (!websiteId) {
            return res.status(400).json({ message: 'Website ID is required' });
        }

        const competitors = await Competitor.find({ website: websiteId }).sort({ createdAt: -1 });
        res.json(competitors);
    } catch (error) {
        console.error('Error fetching competitors:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new competitor
// @route   POST /api/competitors
// @access  Private
const createCompetitor = async (req, res) => {
    try {
        const { name, url, websiteId } = req.body;

        if (!name || !url || !websiteId) {
            return res.status(400).json({ message: 'Name, URL, and Website ID are required' });
        }

        // Verify website exists
        const website = await Website.findById(websiteId);
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        const competitor = await Competitor.create({
            name,
            url,
            website: websiteId,
            client: req.user._id // Assuming authenticated user adds it
        });

        res.status(201).json(competitor);
    } catch (error) {
        console.error('Error creating competitor:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a competitor
// @route   DELETE /api/competitors/:id
// @access  Private
const deleteCompetitor = async (req, res) => {
    try {
        const competitor = await Competitor.findById(req.params.id);

        if (!competitor) {
            return res.status(404).json({ message: 'Competitor not found' });
        }

        await competitor.deleteOne();
        res.json({ message: 'Competitor removed' });
    } catch (error) {
        console.error('Error deleting competitor:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCompetitors,
    createCompetitor,
    deleteCompetitor
};
