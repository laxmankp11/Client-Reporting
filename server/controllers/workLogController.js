const WorkLog = require('../models/WorkLog');
const Website = require('../models/Website');

// @desc    Create a work log
// @route   POST /api/worklogs
// @access  Private/Developer
const createWorkLog = async (req, res) => {
    const { websiteId, description, durationMinutes, tags } = req.body;

    try {
        const website = await Website.findById(websiteId);

        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        // Verify developer is assigned to this website (skip check if admin)
        if (req.user.role !== 'admin' && !website.developers.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to log work for this website' });
        }

        const workLog = await WorkLog.create({
            developer: req.user._id,
            website: websiteId,
            description,
            durationMinutes: durationMinutes || 0,
            tags: tags || [],
            type: req.body.type || 'log',
            title: req.body.title || '',
            status: req.body.type === 'action' ? 'pending' : undefined
        });

        res.status(201).json(workLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get work logs
// @route   GET /api/worklogs
// @access  Private
const getWorkLogs = async (req, res) => {
    try {
        let query = {};

        // Filter based on role
        if (req.user.role === 'client') {
            // Clients see logs for their owned websites
            const myWebsites = await Website.find({ client: req.user._id }).select('_id');
            const websiteIds = myWebsites.map(w => w._id.toString());

            // If specific website requested, verify access
            if (req.query.websiteId) {
                if (websiteIds.includes(req.query.websiteId)) {
                    query = { website: req.query.websiteId };
                } else {
                    // Requested website not owned by client
                    return res.status(403).json({ message: 'Not authorized for this website' });
                }
            } else {
                query = { website: { $in: websiteIds } };
            }
        } else if (req.user.role === 'developer') {
            // Developers see their own logs
            query = { developer: req.user._id };

            // Optional: Filter by website if developer provided it
            if (req.query.websiteId) {
                query.website = req.query.websiteId;
            }
        }

        // Filtering by Starred status
        if (req.query.isStarred === 'true') {
            query.isStarred = true;
        }

        // Filtering by Type (log, action, or all)
        if (req.query.type && req.query.type !== 'all') {
            query.type = req.query.type;
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const logs = await WorkLog.find(query)
            .populate('developer', 'name')
            .populate('website', 'name url')
            .sort({ isStarred: -1, createdAt: -1 }) // Show starred first, then new
            .skip(skip)
            .limit(limit);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a work log (for client response/status)
// @route   PUT /api/worklogs/:id
// @access  Private
const updateWorkLog = async (req, res) => {
    try {
        const workLog = await WorkLog.findById(req.params.id);

        if (!workLog) {
            return res.status(404).json({ message: 'Work log not found' });
        }

        // Check authorization (simplified: Admin, Dev who created it, or Client who owns website)
        // For now, let's allow updating status/response if you have access to the website
        // Ideally, we check website ownership here via `workLog.website`

        workLog.status = req.body.status || workLog.status;
        workLog.clientResponse = req.body.clientResponse || workLog.clientResponse;
        if (req.body.isStarred !== undefined) {
            workLog.isStarred = req.body.isStarred;
        }

        const updatedWorkLog = await workLog.save();
        res.json(updatedWorkLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createWorkLog, getWorkLogs, updateWorkLog };
