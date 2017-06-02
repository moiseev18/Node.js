/**
 * Created by Emmanuel on 4/17/2016.
 */
var locals = require('./locals');
var env = require('./envs');
var elasticsearch = require('elasticsearch');
var elastic = new elasticsearch.Client(env.elasticsearch);

module.exports = elastic;
