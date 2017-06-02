/**
 * Created by Emmanuel on 4/2/2016.
 */
global.__base = __dirname + '/';
global.__logo_dir = __dirname + '/public/uploads/logos';
global.__avatar_dir = __dirname + '/public/uploads/avatars';
var env = require('./config/envs');

global.get_uri = function (dest, req) {
    return 'http://'+req.headers.host+'/'+dest;
};

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejsMate = require('ejs-mate');


//redis server initialization for client configurations
var redisClient = require('./config/redis');
redisClient.hgetall('client_config', function(err, object) {
    //if(object !== null){
     //   console.info('client config already set ', object);
    //}else{
        redisClient.hmset('client_config' , require('./config/client'), function(err, reply){
            console.info('set init client config');
        });
    //}
});

var elasticService = require('./api/services/ElasticService');
//elasticService.deleteIndex("tied_revenue_v1");
elasticService.initIndex(elasticService.INDEX_USERS, 1, require('./api/properties/user'));
elasticService.initIndex(elasticService.INDEX_CLIENT, 1, require('./api/properties/client'));
elasticService.initIndex(elasticService.INDEX_SCHEDULE, 1, require('./api/properties/schedule'));
elasticService.initIndex(elasticService.INDEX_LINE, 1, require('./api/properties/line'));
//elasticService.initIndex(elasticService.INDEX_COWORKERS, 1, require('./api/properties/coworker'));
//elasticService.initIndex(elasticService.INDEX_FEEDS, 1, require('./api/properties/feed'));
//elasticService.initIndex(elasticService.INDEX_ACHIEVEMENTS, 1, require('./api/properties/achievement'));
//elasticService.initIndex(elasticService.INDEX_GOALS, 1, require('./api/properties/goal'));
//elasticService.initIndex(elasticService.INDEX_INVITATION, 1, require('./api/properties/invitation'));
elasticService.initIndex(elasticService.INDEX_REVENUE, 1, require('./api/properties/revenue'));

//elasticService.deleteIndex("tied_lines_v1");

var app = express();
app.use(express.static('public'));
app.use('/logo', express.static('public/uploads/logos'));
app.use('/avatar', express.static('public/uploads/avatars'));
app.set('server_secret', env.server_secret);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

/*
simple client identifying middleware

Identifies the client based on client-key provided.
Identified client is stored in the object - global.client
 */
var clientAuthMiddlesWare = require('./api/middlewares/client_auth');
//app.use(clientAuthMiddlesWare);

var configRoutes = require('./api/routes/config');
app.use('/api/'+env.apiVersion, configRoutes);

var authRoutes = require('./api/routes/auth');
app.use('/api/'+env.apiVersion+'/auth/',authRoutes);

app.get('/', function(req, res) {
    res.json({ message: 'Welcome to tied api' });
});
//
var apiMiddlesWare = require('./api/middlewares/user_auth');
app.use(apiMiddlesWare);


var userRoutes = require('./api/routes/user');
app.use('/api/'+env.apiVersion,userRoutes);

var clientRoutes = require('./api/routes/client');
app.use('/api/'+env.apiVersion, clientRoutes);

var lineRoutes = require('./api/routes/line');
app.use('/api/'+env.apiVersion, lineRoutes);

var scheduleRoutes = require('./api/routes/schedule');
app.use('/api/'+env.apiVersion, scheduleRoutes);


var feedRoutes = require('./api/routes/feed');
app.use('/api/'+env.apiVersion, feedRoutes);

var achievementRoutes = require('./api/routes/achievement');
app.use('/api/'+env.apiVersion, achievementRoutes);

var goalRoutes = require('./api/routes/goal');
app.use('/api/'+env.apiVersion, goalRoutes);

var invitationRoutes = require('./api/routes/invitation');
app.use('/api/'+env.apiVersion, invitationRoutes);

var revenueRoutes = require('./api/routes/revenue');
app.use('/api/'+env.apiVersion, revenueRoutes);




app.use('/api/'+env.apiVersion, require('./api/routes/coworker'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.send({success:false, message:'page not found', code: 404}, 404);
});


app.listen(env.port, function (err) {
    if (err) throw err;
    console.log('Server is Running on Port ' +env.port);
});
