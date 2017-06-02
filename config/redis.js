/**
 * Created by Emmanuel on 4/17/2016.
 */
var locals = require('./locals');
var env = require('./envs');
var redis = require('redis');

console.log(env);

var client = redis.createClient(env.redis.port, env.redis.host);
client.auth(env.redis.password);
client.on('connect', function() {
    console.log('redis server connected');
});

module.exports = client;
