const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const createMessage = async (req, res) => {
    const { content, websiteId } = req.body;

    try {
        const message = await Message.create({
            content,
            website: websiteId,
            sender: req.user._id
        });

        // Populate sender details for immediate frontend display
        await message.populate('sender', 'name role');

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a website
// @route   GET /api/messages/:websiteId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ website: req.params.websiteId })
            .populate('sender', 'name role')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createMessage, getMessages };
