const router = require('express').Router();

const { getUser, editProfile } = require('../controllers/users');

const { validationEditProfile } = require('../middlewares/validations');

router.get('/users/me', getUser);
router.patch('/users/me', validationEditProfile, editProfile);

module.exports = router;
