const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
This middleware uploads issue images.
It validates image type and limits file size.
*/

const uploadDirectory = path.join(__dirname, "..", "..", "uploads", "issues");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const fileExtension = path.extname(file.originalname).toLowerCase();

        cb(null, `issue-${uniqueSuffix}${fileExtension}`);
    }
});

function fileFilter(req, file, cb) {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(fileExtension)
    ) {
        cb(null, true);
        return;
    }

    cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
}

const uploadIssueImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = uploadIssueImage;