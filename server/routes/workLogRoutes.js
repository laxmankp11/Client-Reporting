const express = require('express');
const router = express.Router();
const { createWorkLog, getWorkLogs, updateWorkLog } = require('../controllers/workLogController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createWorkLog)
    .get(protect, getWorkLogs);

router.route('/:id').put(protect, updateWorkLog);

module.exports = router;
