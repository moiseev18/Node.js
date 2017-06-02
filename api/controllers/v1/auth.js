/**
 * Created by Emmanuel on 4/18/2016.
 */
/**
 * Created by Emmanuel on 4/16/2016.
 */

var User = require('../../models/user');
var jwt = require('jsonwebtoken');
var service = require('../../routes/responses/service');
var async = require('async');
var twilio =  require('../../../config/twilio');
var PVCode = require('../../models/pvcode');
var env = require('../../../config/envs');

var elastic = require('../../../config/elastic');
var elasticService = require('../../services/ElasticService');
var version = env.apiVersion;

module.exports = {

    authenticate: function (req, res, next) {
        User
            .find({where: {email: req.body.email}})
            .then(function (foundUser) {
                if (!foundUser) {
                    res.json({success: false, message: 'Authentication failed. User not found.'});
                }
                var password_match = foundUser.comparePassword(req.body.password);
                if (!password_match) {
                    res.json({success: false, message: 'Authentication failed. Wrong password.'});
                }else{
                    foundUser = foundUser.dataValues;
                    var token = jwt.sign(foundUser, req.app.get('server_secret'), {
                        expiresIn: 14400 // expires in 24 hours
                    });

                    elastic.get({
                        index: elasticService.INDEX_USERS,
                        type: elasticService.DOCUMENT_MAIN,
                        id: foundUser.id
                    },function (error, resp) {
                        if (error) {
                            res.json({success: true, message: 'Could not retrieve user'});
                        } else {
                            mainUser = resp._source;
                            mainUser.id = foundUser.id;
                            mainUser.phone = foundUser.phone;
                            mainUser.status = foundUser.status;
                            mainUser.email_verified = foundUser.email_verified;
                            mainUser.phone_verified = foundUser.phone_verified;
                            // return the information including token as JSON
                            res.json({
                                success: true,
                                message: 'Enjoy your token!',
                                token: token,
                                user: mainUser
                            });
                        }
                    });
                }
            }).catch(function (err) {
            console.log(err);
        });
    },
    authenticateEmail: function (req, res) {
        return User
            .find({where: {email: req.body.email}})
            .then(function (foundUser) {
                if (foundUser) {
                    res.json({success: false, message: 'email already exist'});
                } else {
                    res.json({success: true, message: 'email does not exist'});
                }
            }).catch(function (err) {
                res.json({success: true, message: err});
            });
    },
    forgotPassword: function (req, res) {
        //TODO send password retrieval mail
        meta = {}
        if (!req.body.email) {
            meta.statusCode = 505;
            meta.mssg = meta.msg = "Email not specified";
            res.status(meta.statusCode).json(service.generalResponse(meta));
            return;
        }
        email = req.body.email;
        User
            .find({where: {email: req.body.email}})
            .then(function (foundUser) {
                if (!foundUser) {
                    meta.statusCode = 404;
                    meta.developer_message = meta.msg = "Email does not exist";
                    res.status(meta.statusCode).json(service.generalResponse(meta));

                } else {
                    res.json({success: true, message: 'A password retrieval mail has been sent to your mail box'});
                }
            });

    },

    register: function (req, res) {
        console.log('user', req.body);
        var startTime = Date.now();
        var meta = {
            dataName: "user"
        };

        User
            .find({where: {email: req.body.email}})
            .then(function (foundUser) {
                if (foundUser) {
                    res.json({success: false, message: 'user already exist'});
                } else {
                    async.waterfall([function (callback) {
                        return User.sync().then(function () {
                            return User.create({
                                email: req.body.email,
                                password: req.body.password
                            });
                        }).then(function (user) {
                            callback(null, user);
                        }).catch(function (err) {
                            console.log('catch', err);
                            meta.statusCode = 503;
                            meta.mssg = "An error occurred, try again!";
                            meta.extra = err.errors;
                            res.status(meta.statusCode).json(service.generalResponse(meta));
                        });

                    }, function (user) {
                        var esBody = req.body;
                        delete esBody.password;
                        elastic.create({
                            index: elasticService.INDEX_USERS,
                            type: elasticService.DOCUMENT_MAIN,
                            id: user.id,
                            body: esBody
                        }, function (err, response) {
                            if (err) {

                            }
                            else {
                                User
                                    .find({where: {id: user.id}})
                                    .then(function (foundUser) {
                                        if (foundUser) {
                                            return foundUser.update(req.body)
                                                .then(function (updated) {
                                                }).catch(function (err) {
                                                });
                                        }
                                    }).catch(function (err) {
                                    console.log(err);
                                });
                            }
                            meta.statusCode = 201;
                            // meta.helo="fsds";
                            meta.response = response;
                            meta.mssg = "User created successfully";
                            meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                            // console.log(service.singleDataResponse(user, meta))

                            var userObject = {

                                id: user.id,
                                email: user.email,
                                sign_up_stage: req.body.sign_up_stage
                            };

                            var token = jwt.sign(userObject, req.app.get('server_secret'), {
                                expiresIn: 1440 * 30 // expires in 24 hours
                            });
                            userObject.token = token;
                            res.status(meta.statusCode).json(service.singleDataResponse(userObject, meta));

                        });
                    }]);
                }
            }).catch(function (err) {
            res.json({success: false, message: err});

        });
    },
    getToken: function (req, res) {
        return req.body.token || req.query.token || req.headers['x-access-token'];
    },
    getUserLoggedIn: function (req, res) {
        if (!req.params.user_id && req.userLoggedIn && req.userLoggedIn !== "undefined") {
            req.params.user_id = req.userLoggedIn.id;
            return req.userLoggedIn.id;
        }else{
            res.json({success: false, message: 'Authentication failed. Request not authorized.'});
        }
    },

    parseRequest: function (req, res) {
        if (!req.params.user_id && req.userLoggedIn && req.userLoggedIn != undefined) {
            req.params.user_id = req.userLoggedIn.id;
        }else{
            return res.json({success: false, message: 'Authentication failed. Request not authorized.'});
        }
    },

    send_verification_code: function (req, res, next) {
        console.log('user', req.body);
        phone = req.body.phone_number;
        code = Math.floor(Math.random() * (99000 - 10000) + 10000);
        //var client = twilio.client;

        User
            .find({where: {id: req.body.user_id}})
            .then(function (foundUser) {
                if (!foundUser) {
                    res.json({success: false, message: 'Authentication failed. User not found.'});
                } else {
                    twilio.client().sms.messages.create({
                        to: phone,
                        from: twilio.FROM,
                        body: 'Your phone verification code is ' + code
                    }, function (error, message) {
                        if (!error) {
                            return PVCode.sync().then(function () {
                                return PVCode.create({
                                    user_id: req.body.user_id,
                                    phone_number: req.body.phone_number,
                                    code: code
                                });
                            }).then(function (user) {
                                console.log('Success! The SID for this SMS message is:');
                                console.log(message.sid);
                                console.log('Message sent on:');
                                console.log(message.dateCreated);
                                res.status(200).json({success: true, message: "Message sent on : "+message.dateCreated, code : code});
                            }).catch(function (err) {
                                console.log('catch', err);
                                res.status(503).json({success: false, message:"An error occurred, try again!"});
                            });
                        } else {
                            console.log('catch', error);
                            return res.status(503).json({success: false, message:"An error occurred from sms provider, try again!"});
                        }
                    });
                }
            }).catch(function (err) {
            console.log(err);
        });
    },

    verify_code: function (req, res) {
        console.log('user', req.body);
        PVCode
            .find({
                where: {
                    user_id: req.body.user_id,
                    phone_number: req.body.phone_number,
                    code: req.body.code
                }
            })
            .then(function (code) {
                if (!code) {
                    res.json({success: false, message: 'Authentication failed. Code invalid.'});
                } else {
                    User.find({where: {id: req.body.user_id}}).then(function (user) {
                        if (user) { // if the record exists in the db
                            return user.updateAttributes({
                                phone_verified: true
                            }).then(function () {

                                meta.statusCode = 200;
                                meta.response = code;
                                console.log(service.generalResponse(meta))
                               // res.status(meta.statusCode).json(service.generalResponse(meta));
                                res.status(200).json({success: true, message: "Verification successful"});

                            })
                        } else {
                            res.status(503).json({success: false, message:"phone number not verified"});
                        }

                    });
                }
            }).catch(function (err) {
            console.log(err);
        });
    }
};
