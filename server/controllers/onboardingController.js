const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Website = require('../models/Website');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Onboard a new client (User + Website)
// @route   POST /api/onboarding/client
// @access  Public (or protected by API key if needed, keeping public for now as per "Payment success callback")
const onboardClient = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            domain,
            gstin,
            address
        } = req.body;

        // Basic validation
        if (!name || !email || !password || !domain) {
            return res.status(400).json({ message: 'Please provide all required fields: name, email, password, domain' });
        }

        // 1. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Create User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'client',
            gstin,
            address
        });

        // 3. Create Website
        // Ensure domain has protocol
        let websiteUrl = domain;
        if (!websiteUrl.startsWith('http')) {
            websiteUrl = `https://${websiteUrl}`;
        }

        const website = await Website.create({
            name: domain, // Using domain as name as well
            url: websiteUrl,
            client: user._id,
        });

        res.status(201).json({
            message: 'Client and Website created successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                gstin: user.gstin,
                address: user.address,
                token: generateToken(user._id)
            },
            website: {
                _id: website._id,
                name: website.name,
                url: website.url
            }
        });

    } catch (error) {
        console.error('Onboarding Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    onboardClient
};
