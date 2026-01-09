const express = require('express');
const router = express.Router();
const { createWorkLog, getWorkLogs, updateWorkLog, deleteWorkLog } = require('../controllers/workLogController');
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

// Wrapper to handle upload errors
const uploadHandler = (req, res, next) => {
    upload.array('attachments', 5)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || err });
        }
        next();
    });
};

router.route('/')
    .post(protect, uploadHandler, createWorkLog)
    .get(protect, getWorkLogs);

router.route('/:id')
    .put(protect, updateWorkLog)
    .delete(protect, deleteWorkLog);

module.exports = router;
