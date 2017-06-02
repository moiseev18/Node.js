/**
 * Created by Emmanuel on 4/18/2016.
 */

/**
 * Created by Emmanuel on 4/16/2016.
 */

var router = require('express').Router();
var env = require('../../config/envs');
var ApiController = require('../controllers/'+ env.apiVersion+ '/auth');

router.post('/login',ApiController.authenticate)
    .post('/email',ApiController.authenticateEmail)
    .post('/register',ApiController.register)
    .post('/forgot_password',ApiController.forgotPassword)
    .post('/send_phone_vc',ApiController.send_verification_code)
    .post('/verify_phone',ApiController.verify_code);

module.exports = router;
