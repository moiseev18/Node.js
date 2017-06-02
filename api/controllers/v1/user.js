/**
 * Created by Emmanuel on 4/16/2016.
 */

var _ = require('underscore');
var service = require('../../routes/responses/service');
var User = require('../../models/user');
var env = require('../../../config/envs');


var elastic = require('../../../config/elastic');
var elasticService = require('../../services/ElasticService');
var auth = require("../v1/auth");

module.exports = {

    find: function (req, res) {
        var startTime = Date.now();
        var meta = {
            dataName: "users"
        };

        if (!req.params.user_id && req.userLoggedIn) {
            req.params.user_id = req.userLoggedIn.id;
        }
        User
            .findAll({limit: 10})
            .then(function (users) {
                if (users) {
                    meta.statusCode = 200;
                    meta.dataName = "users";
                    if (_.isEmpty(users)) {
                        meta.mssg = "Empty result returned";
                    }
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    res.json(200, service.multipleDataResponse(users, meta));
                } else {
                    meta.statusCode = 503;
                    meta.mssg = "An error occurred while getting users data";
                    meta.extra = err;
                    res.json(503, service.generalResponse(meta));
                }
            });
    },

    findById: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "users"
        };
        if (!req.params.user_id && req.userLoggedIn) {
            req.params.user_id = req.userLoggedIn.id;
        }
        User
            .find({where: {id: req.params.user_id}})
            .then(function (foundUser) {
                if (foundUser) {
                    meta.statusCode = 200;
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    res.json(200, service.singleDataResponse(foundUser, meta));
                } else {
                    meta.statusCode = 404;
                    meta.mssg = "No user found for your query";
                    user = {};
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    res.status(meta.statusCode).json(service.singleDataResponse(user, meta));
                }
                next();
            }).catch(function (err) {
            console.log(err);
        });
    },
    findByIdFromElastic: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "user"
        };
        //auth.getUserLoggedIn(req, res);
        console.log("iser ", req.userLoggedIn);
        console.log("femiiiiiiiiiiii", req.headers.host);
        elastic.get({
            index: elasticService.INDEX_USERS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.user_id
        }).then(
            function (resp) {
                console.log(resp);
                foundUser = resp._source;
                foundUser.id = resp._id;
                delete foundUser._id;
                if (foundUser.avatar) {
                    foundUser.avatar = (foundUser.avatar == "" ? "" : global.get_uri('avatar/' + foundUser.avatar, req));
                }
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(foundUser, meta));

            },
            function (err) {
                //console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "No user found for your query";
                user = {};
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(user, meta));

            }
        );
    },
    findByEmail: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "users"
        };
        if (!req.params.user_id && req.userLoggedIn) {
            req.params.user_id = req.userLoggedIn.id;
        }
        User
            .find({where: {email: req.params.email}})
            .then(function (foundUser) {
                if (foundUser) {
                    meta.statusCode = 200;
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    res.json(200, service.singleDataResponse(foundUser, meta));
                } else {
                    meta.statusCode = 404;
                    meta.mssg = "No user found for your query";
                    user = {};
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    res.status(meta.statusCode).json(service.singleDataResponse(user, meta));
                }
                next();
            }).catch(function (err) {
            console.log(err);
        });
    },

    update: function (req, res) {
        var startTime = Date.now();
        var meta = {
            dataName: "users"
        };
        if (!req.params.user_id && req.userLoggedIn) {
            req.params.user_id = req.userLoggedIn.id;
        }
        User
            .find({where: {id: req.params.user_id}})
            .then(function (foundUser) {
                if (foundUser) {
                    return foundUser.update(req.body)
                        .then(function (updated) {
                            meta.statusCode = 200;
                            meta.dataName = "users";
                            meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                            res.status(meta.statusCode).json(service.singleDataResponse(updated, meta));
                        }).catch(function (err) {
                            meta.statusCode = 503;
                            meta.mssg = "An error occurred, try again!";
                            meta.extra = err.errors;
                            res.status(meta.statusCode).json(service.generalResponse(meta));
                        });
                } else {
                    meta.statusCode = 404;
                    meta.mssg = "We don't have this record in our database";
                    res.status(meta.statusCode).json(service.generalResponse(meta));
                }
            }).catch(function (err) {
            console.log(err);
        });
    },

    changePassword: function (req, res) {
        auth.parseRequest(req);
        if (!req.params.user_id && req.userLoggedIn) {
            req.params.user_id = req.userLoggedIn.id;
        }
        User
            .find({where: {id: req.params.user_id}})
            .then(function (foundUser) {
                if (foundUser) {
                    var password_match = foundUser.comparePassword(req.body.password);
                    if(password_match){
                        req.body.password = req.body.new_password;
                        return foundUser.update(req.body)
                            .then(function (updated) {
                                res.json({success: true, message: 'Password updated successfully'});
                            }).catch(function (err) {
                                res.json({success: false, message: 'Could not update password'});
                            });
                    }else{
                        res.json({success: false, message: 'Wrong password !!!'});
                    }
                } else {
                    res.json({success: false, message: "We don't have this record in our database"});
                }
            }).catch(function (err) {
                console.log(err);
            });
    },

    updateElastic: function (req, res) {
        var startTime = Date.now();
        var meta = {
            dataName: "users"
        };
        user = {};
        var data = req.body;
        try {
            data.avatar = (req.file ? (req.file.filename) : "");
        } catch (e) {

        }


        auth.parseRequest(req, res);
        delete data.password;
        delete data.email;
        elastic.update({
            index: elasticService.INDEX_USERS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.user_id,
            body: {doc: data}
        }, function (err, response) {
            if (err) {
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not update user";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(user, meta));
            }
            else {
                console.log(response);
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "user update successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                user.id = response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(user, meta));
            }
        })
    },

    destroy: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "users"
        };
        auth.parseRequest(req);
        User
            .find({where: {id: req.params.user_id}})
            .then(function (foundUser) {
                if (foundUser) {
                    return foundUser.destroy()
                        .then(function (deleted) {
                            meta.statusCode = 200;
                            meta.mssg = "user deleted successfully";
                            meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                            res.status(meta.statusCode).json(service.generalResponse(meta));
                        }).catch(function (err) {
                            console.log('error', err);
                            meta.statusCode = 503;
                            meta.mssg = "An error occurred, try again!";
                            meta.extra = err.errors;
                            res.status(meta.statusCode).json(service.generalResponse(meta));
                        });
                } else {
                    meta.statusCode = 404;
                    meta.mssg = "Delete failed! We don't have this record in our database";
                    res.status(meta.statusCode).json(service.generalResponse(meta));
                }
            }).catch(function (err) {
            console.log(err);
        });
    },

    updateUser: function (req, res, next) {
        console.log(req.body);
        auth.parseRequest(req, res);

        var data = req.body;
        try {
            data.avatar = (req.file ? (req.file.filename) : "");
            console.log(data.avatar);
        } catch (e) {
            console.log("nonsense");
        }

        try {
            data.office_address.coordinate = {
                lat: parseFloat(req.body.office_address.coordinate.lat), lon: parseFloat(req.body.office_address.coordinate.lon)
            };

            data.home_address.coordinate = {
                lat: parseFloat(req.body.home_address.coordinate.lat), lon: parseFloat(req.body.home_address.coordinate.lon)
            }
        }catch(e) {

        }

        if(data.token){
            delete data.token;
        }

        elastic.update({
            index: elasticService.INDEX_USERS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.user_id,
            body: {doc: data}
        }, function (err, response) {
            if (err) {
                console.trace(err.message);
                res.json({success: false, message: 'Could not update user', user : data});
            }
            else {
                console.log(response);
                res.json({success: true, message: 'user update successfully', user: data});
            }
        })
    },

    updateEmployer: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "users"
        };
        console.log(req.body);
        auth.getUserLoggedIn(req, res);

        elastic.update({
            index: elasticService.INDEX_USERS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.body.user_id,
            body: {doc: req.body}
        }, function (err, response) {
            if (err) {
                console.log('cannot save user to elastic', err);
                meta.statusCode = 503;
                meta.mssg = "An error occurred, try again!";
                meta.extra = err.errors;
                res.status(meta.statusCode).json(service.generalResponse(meta));

            }
            else {
                meta.statusCode = 201;
                meta.response = response;
                meta.mssg = "User created successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(req.body, meta));
            }
        });

    },

    getEmployers: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "users"
        };
    }
};
