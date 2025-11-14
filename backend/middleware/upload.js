// middleware/upload.js
const multer = require('multer');
const fs = require('fs');


const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // temporary local folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// create upload instance
const upload = multer({ storage });

// export properly
module.exports = upload;
