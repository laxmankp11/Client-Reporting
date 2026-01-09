const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type
// Check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|csv|xls|xlsx/;

    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    // Check mime
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-word.document.macroenabled.12', // .docm
        'text/csv', // .csv
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/octet-stream' // generic fallback often used for csv/excel
    ];

    // Let's exclude octet-stream for now to be safe, unless we really need it.
    // But wait, the previous code was failing for `msword`.

    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        console.log(`Upload blocked: Ext=${path.extname(file.originalname)} Mime=${file.mimetype}`);
        cb('Error: File type not supported!');
    }
}

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
