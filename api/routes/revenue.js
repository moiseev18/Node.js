/**
 * Created by femi on 9/4/2016.
 */
var router = require('express').Router();
var env = require('../../config/envs');
var revenueController = require('../controllers/'+ env.apiVersion+ '/revenue');

router.get('/revenue/:page_number',revenueController.find)
    .get('/revenue/:revenue_id/', revenueController.findById)
    .post('/revenue', revenueController.add)
    .put('/revenue/:revenue_id/',revenueController.update)
    .delete('/revenue/:revenue_id/',revenueController.destroy);


module.exports = router;
