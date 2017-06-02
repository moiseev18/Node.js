/**
 * Created by Emmanuel on 4/29/2016.
 */
var env = require('../../config/envs');
var router = require('express').Router();
var AchController = require('../controllers/'+ env.apiVersion+ '/achievement');

router.get('/achievements/:page_number',AchController.find)
    .get('/achievement/:achievement_id/',AchController.findById)
    .post('/achievements', AchController.create)
    .put('/achievement/:achievement_id/',AchController.update)
    .delete('/achievement/:achievement_id/',AchController.destroy);

router.post('/achievements/:user_id/date',AchController.findByDate);

module.exports = router;
