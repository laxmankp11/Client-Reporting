const express = require('express');
const router = express.Router();
const { createWebsite, getWebsites, updateWebsite, deleteWebsite } = require('../controllers/websiteController');
const { scanWebsite } = require('../controllers/seoController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin'), createWebsite)
    .get(protect, getWebsites);

router.route('/:id')
    .put(protect, authorize('admin'), updateWebsite)
    .delete(protect, authorize('admin'), deleteWebsite);

router.route('/:id/scan').post(protect, authorize('admin'), scanWebsite);
router.route('/:id/gsc').get(protect, require('../controllers/gscController').getGscStats);

module.exports = router;
