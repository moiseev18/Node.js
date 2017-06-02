/**
 * Created by Emmanuel on 4/29/2016.
 */
var router = require('express').Router();
var env = require('../../config/envs');
var FeedsController = require('../controllers/'+ env.apiVersion+ '/feed');

router.get('/feeds/:page_number',FeedsController.find)
    .get('/feed/:feed_id/',FeedsController.findById)
    .post('/feeds', FeedsController.create)
    .put('/feed/:feed_id/',FeedsController.update)
    .delete('/feed/:feed_id/',FeedsController.destroy);

router.post('/feeds/:user_id/date',FeedsController.findByDate);

module.exports = router;
