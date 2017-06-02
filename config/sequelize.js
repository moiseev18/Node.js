/**
 * Created by Emmanuel on 4/16/2016.
 */

var locals = require('./locals');
var env = require('./envs');
var Sequelize = require('sequelize');

var options = {
    port: env.sequelize.port,
    host: env.sequelize.host,
    logging: true
};
var sequelize = new Sequelize(env.sequelize.database,
    env.sequelize.username,
    env.sequelize.password,
    options);

sequelize
    .sync()
    .then(function (info) {
        console.log('sequelize Database connection successful! ');
    }, function (err) {
        console.log('An error occurred while creating the table: ', err);
    });

module.exports = sequelize;
