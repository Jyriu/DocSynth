const express = require('express');
const multer = require('multer');
const auth = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/summary.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // keep file in memory

router.post('/generate', auth, upload.single('file'), ctrl.generate);
router.get('/history/me', auth, ctrl.historyMe);
router.get('/by-user/:userId', auth, ctrl.getByUser);
router.get('/:id', auth, ctrl.getOne);

module.exports = router;
