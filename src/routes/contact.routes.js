const router = require('express').Router();
const ctrl = require('../controllers/contact.controller');
const validate = require('../middlewares/validate');
const { contact } = require('../validations/contact.validation');

router.post('/', validate(contact), ctrl.contact);

module.exports = router;
