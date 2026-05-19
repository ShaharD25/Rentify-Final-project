const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
This middleware uploads chat files.
It supports images and PDF files with a safe file size limit.
*/

const uploadDirectory = path.join(__dirname, "..", "..", "uploads", "chat");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const safeOriginalName = file.originalname.replace(/\s+/g, "-");

        cb(null, `chat-${uniqueSuffix}-${safeOriginalName}`);
    }
});

function fileFilter(req, file, cb) {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(fileExtension)
    ) {
        cb(null, true);
        return;
    }

    cb(new Error("Only JPG, PNG, WEBP, and PDF files are allowed."));
}

const uploadChatFile = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = uploadChatFile;