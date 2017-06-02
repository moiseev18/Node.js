
/**
 * Created by FEMI on 5/7/2016.
 */
var router = require('express').Router();
var env = require('../../config/envs');
var cwController = require('../controllers/'+ env.apiVersion+ '/coworker');

router.get('/coworkers/:page_number',cwController.find)
    .get('/coworkers/:coworker_id/',cwController.findById)
    .get('/users/:user_id/coworkers',cwController.findByUserId)
   // .post('/coworkers', cwController.create)
    .put('/coworkers/:coworker_id/',cwController.update)
    .delete('/coworkers/:coworker_id/',cwController.destroy)
    .post('/users/:user_id/coworkers', cwController.add)
    .get('/coworkers/are_coworkers/:user_id/:coworker_id',cwController.areCoworkers)

module.exports = router;
