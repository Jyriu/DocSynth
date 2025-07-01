const router = require('express').Router();
const ctrl = require('../controllers/document.controller');

const auth = require('../middlewares/auth.middleware');
// Protected: user must be authenticated to upload a document
router.post('/', auth, ctrl.create);
router.get('/:id', ctrl.getOne);

module.exports = router;
