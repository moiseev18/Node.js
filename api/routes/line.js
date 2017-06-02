/**
 * Created by Emmanuel on 4/29/2016.
 */
var router = require('express').Router();
var env = require('../../config/envs');
var LineController = require('../controllers/'+ env.apiVersion+ '/line');

router.get('/lines/:page_number',LineController.find)
    .get('/lines/:line_id/',LineController.findById)
    .post('/lines', LineController.create)
    .put('/lines/:line_id/',LineController.update)
    .delete('/lines/:line_id/',LineController.destroy);


module.exports = router;
