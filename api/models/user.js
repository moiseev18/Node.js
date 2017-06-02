/**
 * Created by Emmanuel on 4/16/2016.
 */

var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var ejs = require('ejs');
var EmailService = require('../services/EmailService');
var Sequelize = require('sequelize');

var locals = require(__base+'/config/locals');
var env = global.env;

var sequelize =  require(__base+'/config/sequelize');

var User = sequelize.define('user', {
    email: {
        type : Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    email_verified: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    status: {type: Sequelize.ENUM('enabled', 'disabled', 'deleted'), defaultValue: 'enabled'},
    password: Sequelize.STRING,
    phone: Sequelize.STRING,
    phone_verified: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    indexed: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false}
},{
    classMethods: {

    },
    instanceMethods: {
        comparePassword: function(password) {
            //return password +' '+this.password;
            return bcrypt.compareSync(password, this.password);
        },
        toJSON: function () {
            var values = this.get();

            delete values.password;
            return values;
        }
    }
});

User.beforeCreate( function ( instance, options, next) {
    console.log("before create");
    if(instance.dataValues.password){
        bcrypt.genSalt(10, function(err, salt){
            if(err) return next(err);
            bcrypt.hash(instance.dataValues.password, salt, null, function (err, hash) {
                if(err) return next(err);
                instance.dataValues.password = hash;
                next();
            });
        })
    }
});

User.beforeUpdate( function ( instance, options, next) {
    console.log("before update");
    if(instance.dataValues.password){
        bcrypt.genSalt(10, function(err, salt){
            if(err) return next(err);
            bcrypt.hash(instance.dataValues.password, salt, null, function (err, hash) {
                if(err) return next(err);
                instance.dataValues.password = hash;
                next();
            });
        })
    }
});

//
//User.afterCreate( function ( instance, options , next) {
//    console.info('afterCreate am here');
//    var file_path = './emails/welcome.ejs';
//    // get template from file system
//    var templateString = fs.readFileSync(file_path, 'utf-8');
//    var data = {
//        user: instance.dataValues
//    };
//    templateString = ejs.render(templateString.toString(), data);
//    EmailService.send(instance.dataValues.email, 'Welcome', templateString, next());
//});

module.exports = User;
