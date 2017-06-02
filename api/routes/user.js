/**
 * Created by Emmanuel on 4/16/2016.
 */
var multer = require('multer');
var env = require('../../config/envs');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, global.__avatar_dir)
    },
    filename: function (req, file, cb) {
        var filename = file.originalname;
        var ext = (filename.split('.').pop());
        console.log('user', req.body);
        cb(null, "avatar_"+req.body.id +"."+ ext);
    }
});
var uploader = multer({
    storage: storage
});
var router = require('express').Router();
var UserController = require('../controllers/' + env.apiVersion + '/user');
var clientController = require('../controllers/' + env.apiVersion + '/client');
var LineController = require('../controllers/' + env.apiVersion + '/line');
var ScheduleController = require('../controllers/' + env.apiVersion + '/schedule');
var cwController = require('../controllers/' + env.apiVersion + '/coworker');
var FeedController = require('../controllers/' + env.apiVersion + '/feed');
var AchController = require('../controllers/' + env.apiVersion + '/achievement');
var GoalController = require('../controllers/' + env.apiVersion + '/goal');
var InvitationController = require('../controllers/' + env.apiVersion + '/invitation');
var RevenueController = require('../controllers/' + env.apiVersion + '/revenue');

router.get('/users', UserController.find)
    .get('/users/me/', UserController.findByIdFromElastic)
    //.put('/users/me/', uploader.single('avatar'), UserController.updateElastic)
    .put('/users/me/',uploader.single('avatar'), UserController.updateUser)
    .delete('/users/me/', UserController.destroy);

router.get('/users/me/clients/', clientController.findByUserWithRevenue);
router.get('/users/me/clients/:page_number', clientController.findByUserWithRevenue);
router.get('/users/me/clients_count', clientController.countUserClient);
router.get('/users/me/lines/', LineController.findByUser);
router.get('/users/me/lines/:page_number', LineController.findByUser);

router.get('/users/me/lines/:line_id/revenues/', RevenueController.findByUserLine);
router.get('/users/me/lines/:line_id/revenues/:page_number', RevenueController.findByUserLine);

router.get('/users/me/schedules/', ScheduleController.findByUser);
router.get('/users/me/schedules/:page_number', ScheduleController.findByUser);

router.get('/users/me/schedules_count', ScheduleController.countUserSchedule);
router.post('/users/me/schedules/date', ScheduleController.findByDate);

router.post('/users/me/schedules/around/',ScheduleController.findByDistance)
router.post('/users/me/schedules/around/:page_number',ScheduleController.findByDistance)

router.post('/users/me/clients/unvisited/',clientController.findByDateLastVisited)
router.post('/users/me//clients/unvisited/:page_number',clientController.findByDateLastVisited)

router.get('/users/me/feeds/:page_number', FeedController.findByUser);
router.get('/users/me/achievement/:page_number', AchController.findByUser);


router.get('/users/me/goals/', GoalController.findByUser);
router.get('/users/me/goals/:page_number', GoalController.findByUser);

router.get('/users/:user_id/has_coworker/:coworker_id', cwController.areCoworkers)
    .get('/users/:user_id/', UserController.findByIdFromElastic)
    .get('/users/find_by_email/:email', UserController.findByEmail)
    .put('/users/:user_id/', uploader.single('avatar'), UserController.updateElastic)
    .post('/users/changePassword', UserController.changePassword);
//.delete('/users/:user_id/',UserController.destroy);

router.post('/users/me/clients/geo', clientController.findByDistance);
router.get('/users/:user_id/clients/', clientController.findByUser);
router.get('/users/:user_id/clients/:page_number', clientController.findByUser);
router.get('/users/:user_id/lines/:page_number', LineController.findByUser);
router.get('/users/:user_id/schedules/:page_number', ScheduleController.findByUser);
router.get('/users/:user_id/feeds/:page_number', FeedController.findByUser);
router.get('/users/:user_id/achievement/:page_number', AchController.findByUser);
router.get('/users/:user_id/goals/:page_number', GoalController.findByUser);
router.get('/users/:user_id/invitations/:page_number', InvitationController.findByUser);

module.exports = router;
