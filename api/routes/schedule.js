/**
 * Created by Emmanuel on 4/29/2016.
 */
var router = require('express').Router();
var env = require('../../config/envs');
var ScheduleController = require('../controllers/'+ env.apiVersion+ '/schedule');

router.get('/schedules/:page_number',ScheduleController.find)
    .get('/schedule/:schedule_id',ScheduleController.findById)
    .post('/schedules/:user_id/around/',ScheduleController.findByDistance)
    .post('/schedules/:user_id/around/:page_number',ScheduleController.findByDistance)
    .post('/schedules', ScheduleController.create)
    .put('/schedules/:schedule_id/',ScheduleController.update)
    .delete('/schedules/:schedule_id/',ScheduleController.destroy);

module.exports = router;
