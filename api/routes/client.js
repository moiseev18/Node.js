/**
 * Created by FEMI on 4/27/2016.
 */
var router = require('express').Router();
var randomString = require("randomstring");
var multer = require('multer');
var env = require('../../config/envs');
var version = env.apiVersion;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,   global.__logo_dir)
    },
    filename: function (req, file, cb) {
        var filename = file.originalname;
        var ext = (filename.split('.').pop());
        // console.log('femi', req.userLoggedIn)
        cb(null, randomString.generate(32) +"."+ ext);
    }
});
var uploader = multer({
    storage: storage
});
var clientController = require('../controllers/'+ version+ '/client');

router.get('/client/:client_id',clientController.findById)
   // .get('/clients/:client_id',clientController.findById)
    .post('/clients/:user_id/unvisited/',clientController.findByDateLastVisited)
    .post('/clients/:user_id/unvisited/:page_number',clientController.findByDateLastVisited)
    .post('/clients', uploader.single('logo'), clientController.create)
    .put('/clients/:client_id/',uploader.single('logo'),clientController.update)
    .delete('/clients/:client_id/',clientController.destroy);

module.exports = router;
