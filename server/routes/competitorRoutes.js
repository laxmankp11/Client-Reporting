const express = require('express');
const router = express.Router();
const { getCompetitors, createCompetitor, deleteCompetitor } = require('../controllers/competitorController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getCompetitors)
    .post(protect, createCompetitor);

router.route('/:id')
    .delete(protect, deleteCompetitor);

module.exports = router;
