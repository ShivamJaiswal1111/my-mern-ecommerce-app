import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// API route for image upload
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided.' });
  }
  // Multer stores the file path in req.file.path (e.g., 'uploads\image-timestamp.jpg' on Windows)

  // FIX: Convert backslashes to forward slashes and prepend full backend URL
  const relativePath = req.file.path.replace(/\\/g, '/'); // Replaces all backslashes with forward slashes
  const fullImageUrl = `http://localhost:5001/${relativePath}`; // Prepend your backend URL

  res.status(200).json({
    message: 'Image uploaded successfully!',
    filePath: fullImageUrl // Now returns the full, correct URL
  });
});

export default router;