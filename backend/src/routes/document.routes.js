const router = require('express').Router();
const multer = require('multer');
const ctrl = require('../controllers/document.controller');
const auth = require('../middlewares/auth.middleware');

// Stocker dans ./uploads/
const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, 'uploads/');
  },
  filename: function (_, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/', auth, upload.single('file'), ctrl.create);
router.get('/mine', auth, ctrl.getMine);

module.exports = router;
