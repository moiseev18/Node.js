/**
 * Created by Emmanuel on 4/18/2016.
 */

/**
 * Created by Emmanuel on 4/16/2016.
 */

var router = require('express').Router();
var env = require('../../config/envs');
var ConfigController = require('../controllers/'+env.apiVersion+'/config');


router.get('/config',ConfigController.all)
    .post('/config',ConfigController.store)
    .get('/server_time', ConfigController.getDate)
    .get('/config/:key',ConfigController.find);

module.exports = router;
