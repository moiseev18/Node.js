/**
 * Created by Emmanuel on 4/18/2016.
 */
/**
 * Created by Emmanuel on 4/16/2016.
 */

var Sequelize = require('sequelize');

var locals = require('../../config/locals');
var env = global.env;
var sequelize =  require('./config/sequelize');

var ApiKey = sequelize.define('api_keys', {
    api_key: {
        type: Sequelize.STRING,
        allowNull: true
    },
    api_secret: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

ApiKey.beforeCreate( function ( instance, options, next) {

});

ApiKey.afterCreate( function ( instance, options , next) {
    console.info('afterCreate am here');
});

module.exports = ApiKey;
