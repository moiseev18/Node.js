/**
 * Created by Emmanuel on 5/23/2016.
 */
/**
 * Created by Emmanuel on 4/16/2016.
 */

var Sequelize = require('sequelize');

var sequelize =  require(__base+'/config/sequelize');

var User = require('../models/user');

var PVCode = sequelize.define('pvcode', {
    user_id: Sequelize.STRING,
    phone_number: Sequelize.STRING,
    code: Sequelize.STRING
},{});

PVCode.afterCreate( function ( instance, options , next) {
    var record = instance;
    console.info('form before user_id ', record.dataValues);
    User.find({ where: {id: record.user_id} }).then(function(user) {
        if (user) { // if the record exists in the db
            return user.updateAttributes({
                phone: record.phone_number
            }).then(function() {
                next();
            });
        }
        next();
    });
});

module.exports = PVCode;
