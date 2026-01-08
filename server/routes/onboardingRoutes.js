const express = require('express');
const router = express.Router();
const { onboardClient } = require('../controllers/onboardingController');

router.post('/client', onboardClient);

module.exports = router;
