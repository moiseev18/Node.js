/**
 * Created by Emmanuel on 4/29/2016.
 */
var router = require('express').Router();
var env = require('../../config/envs');
var GoalController = require('../controllers/'+ env.apiVersion+ '/invitation');

router.get('/invitations/:page_number',GoalController.find)
    .get('/invitation/:invitation_id/',GoalController.findById)
    .post('/invitations', GoalController.create)
    .put('/invitation/:invitation_id/',GoalController.update)
    .delete('/invitation/:invitation_id/',GoalController.destroy);

module.exports = router;
