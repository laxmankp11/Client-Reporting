const cheerio = require('cheerio');
const axios = require('axios');
const Website = require('../models/Website');

// @desc    Scan website for SEO tags
// @route   POST /api/websites/:id/scan
// @access  Private/Admin
// @desc    Scan website logic (Reusable)
const runScan = async (website) => {
    let targetUrl = website.url;
    if (!targetUrl.startsWith('http')) {
        targetUrl = `https://${targetUrl}`;
    }

    const start = Date.now();
    const response = await axios.get(targetUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    const loadTime = Date.now() - start;

    const $ = cheerio.load(response.data);
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    const h1 = [];
    $('h1').each((i, el) => h1.push($(el).text().trim()));

    // Calculate Score
    let score = 0;
    if (title) score += 20;
    if (description) score += 20;
    if (ogTitle) score += 10;
    if (ogImage) score += 10;
    if (h1.length > 0) score += 20;
    if (loadTime < 2000) score += 20;

    website.seoData = {
        title,
        description,
        h1,
        ogTitle,
        ogImage,
        loadTime
    };
    website.seoHealthScore = score;
    website.lastSeoScan = Date.now();

    await website.save();
    return website;
};

// @desc    Scan website for SEO tags
// @route   POST /api/websites/:id/scan
// @access  Private/Admin
const scanWebsite = async (req, res) => {
    try {
        const website = await Website.findById(req.params.id);
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        const updatedWebsite = await runScan(website);
        res.json(updatedWebsite);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Failed to scan website: ${error.message}` });
    }
};

module.exports = { scanWebsite, runScan };
