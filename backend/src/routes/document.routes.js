const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middlewares/auth.middleware');
const documentController = require('../controllers/document.controller');

// -----------------------------
// CONFIG MULTER
// -----------------------------
const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, 'uploads/');
  },
  filename: function (_, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


// -----------------------------
// DOCUMENT ROUTES
// -----------------------------
router.post('/', auth, upload.single('file'), documentController.create);
router.get('/mine', auth, documentController.getMine);


module.exports = router;