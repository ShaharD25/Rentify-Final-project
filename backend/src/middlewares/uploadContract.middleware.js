const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
Create the uploads/contracts folder if it does not exist.
*/
const uploadFolder = path.join(__dirname, "..", "..", "uploads", "contracts");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

function fileFilter(req, file, cb) {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt = path.extname(file.originalname).toLowerCase() === ".pdf";

  if (isPdfMime && isPdfExt) {
    return cb(null, true);
  }

  cb(new Error("Only PDF files are allowed."));
}

const uploadContract = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

module.exports = uploadContract;