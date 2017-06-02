/**
 * Created by Emmanuel on 4/29/2016.
 */
var router = require('express').Router();
var env = require('../../config/envs');
var GoalController = require('../controllers/'+ env.apiVersion+ '/goal');

router.get('/goals/:page_number',GoalController.find)
    .get('/goal/:goal_id/',GoalController.findById)
    .post('/goals', GoalController.create)
    .put('/goal/:goal_id/',GoalController.update)
    .delete('/goal/:goal_id/',GoalController.destroy);

router.post('/goals/:user_id/date',GoalController.findByDate);

module.exports = router;
