/**
 * Created by Emmanuel on 4/29/2016.
 */

var _ = require('underscore');
var service = require('../../routes/responses/service');
var elastic = require('../../../config/elastic');
var elasticService = require('../../services/ElasticService');
var auth = require("../v1/auth");
var env = require('../../../config/envs');
var client = require('../v1/client');

var self = {

    find: function (req, res) {
        var startTime = Date.now();
        var meta = {
            dataName: "schedules"
        };
        auth.getUserLoggedIn(req, res);
        var schedule = {};
        var size = elasticService.PAGE_DATA_COUNT;

        elastic.search({
            index: elasticService.INDEX_SCHEDULE,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                size: size,
                from: (req.params.page_number) ? req.params.page_number * size : 0
            }
        }, function (err, response) {
            if (err) {
                console.log(err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No schedule found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(schedule, meta));
            } else {
                schedule = response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(schedule, meta));
            }
        });
    },
    create: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "schedule"
        };
        auth.parseRequest(req, res);
        var data = req.body;
        data.user_id = req.params.user_id;
        console.log(data);
        elastic.create({
            index: elasticService.INDEX_SCHEDULE,
            type: elasticService.DOCUMENT_MAIN,
            body: data
        }, function (err, response) {
            if (err) {
                console.log(err);
                meta.statusCode = 503;
                meta.msg = "'cannot save schedule to elastic'";
                meta.extra = err.errors;
                res.status(meta.statusCode).json(service.generalResponse(meta));
            }
            else {
                console.log('response : ', data);
                data.id = response._id;
                meta.statusCode = 201;
                meta.response = response;
                meta.mssg = "Schedule created successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(data, meta));
            }
        });
    },

    findById: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "schedules"
        };
        var schedule = {};
        auth.getUserLoggedIn(req, res);

        elastic.get({
            index: elasticService.INDEX_SCHEDULE,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.schedule_id
        }).then(
            function (resp) {
                schedule = resp._source;
                schedule.id = resp._id;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(schedule, meta));
            },
            function (err) {
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No schedule found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(schedule, meta));
            }
        );
    },
    findByDistance: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "data"
        };
        var schedule = {};
        auth.getUserLoggedIn(req, res);
        var size= elasticService.PAGE_DATA_COUNT;
        var distance = req.body.distance;
        var location = req.body.location;
        if(!location){
            location =  {
                "lat": 6.4880256,
                "lon": 3.3554882
            }
        }

        if(!distance){
            distance = "20m";
        }
        elastic.search({
            index: elasticService.INDEX_SCHEDULE,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                //fields : ["_id", "coworker_id"],
                query: {
                    filtered : {
                        query: {
                            bool: {
                                must: [
                                    {
                                        term: {
                                            user_id: req.params.user_id
                                        }

                                    }
                                ],
                                must_not: [
                                    {
                                        term: {
                                            visited: true
                                        }
                                    }
                                ]
                            }
                        },
                        filter : {
                            geo_distance : {
                                distance :  distance,
                                "location.coordinate" : location
                            }
                        }
                    }
                },
                filter: {
                    term: {
                        verified: true
                    }
                },
                size: size,
                "sort" : [
                    {
                        "_geo_distance" : {
                            "location.coordinate" : location,
                            "order" : "asc",
                            "unit" : "m"
                        }
                    }
                ],
                from: elasticService.getPageNumber(req, size)
            }
        },
            function (err, response) {
                if (!err) {

                    var client_id = [];
                    if(response.hits) {
                        var hits = response.hits.hits;
                        console.log(response.hits)
                        var len = hits.length;

                        for (var i = 0; i < len; i++) {
                            client_id.push(hits[i].user_id);
                        }
                    }
                    client.findByIds(client_id, function(err, resp) {
                        if (err) {
                            console.log(err)
                            meta.extra = err.errors;
                            meta.statusCode = 404;
                            console.log(err)
                            meta.msg = "No schedule found for your query";
                            meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                            res.status(meta.statusCode).json(service.singleDataResponse(schedule, meta));
                        }else {
                            meta.statusCode = 200;
                            meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                            result={}
                            result.schedules=elasticService.parseArrayResponse(resp);
                            result.clients=resp;
                            res.status(meta.statusCode).json(service.singleDataResponse(result, meta));
                        }
                    })
                }
                if (err) {
                    meta.extra = err.errors;
                    meta.statusCode = 404;
                    console.log(err)
                    meta.msg = "No schedule found for your query";
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    res.status(meta.statusCode).json(service.singleDataResponse(schedule, meta));
                }
            }
        );
    },
    update: function (req, res, next) {
        auth.parseRequest(req, res);
        var startTime = Date.now();
        var meta = {
            dataName: "schedule"
        };

        var data = req.body;
        delete data.user_id;
        var schedule = {};
        elastic.update({
            index: elasticService.INDEX_SCHEDULE,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.schedule_id,
            body: {doc: data}
        }, function (err, response) {
            if (err) {
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not update schedule";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(schedule, meta));
            }
            else {
                console.log(response);
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Schedules update successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                schedule.id = response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(schedule, meta));
            }
        })

    },

    destroy: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "schedules"
        };

        console.log('id  : ', req.params.schedule_id);

        var schedule = {};

        elastic.delete({
            index: elasticService.INDEX_SCHEDULE,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.schedule_id
        }, function (err, response) {
            if (err) {
                console.log('err  : ', err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No schedule found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(schedule, meta));
            }
            else {
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Schedule deleted successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                schedule.id = response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(response, meta));
            }
        })
    },

    findByUser: function (req, res) {
        auth.parseRequest(req, res);

        var startTime = Date.now();
        var meta = {
            dataName: "schedules"
        };

        var schedule = {};
        var size = elasticService.PAGE_DATA_COUNT;

        elastic.search({
            index: elasticService.INDEX_SCHEDULE,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                query: {
                    match: {
                        user_id: req.params.user_id
                    }
                },
                size: size,
                "sort": {"date": {"order": "desc"}},
                from: (req.params.page_number) ? req.params.page_number * size : 0
            }
        }, function (err, response) {
            if (err) {
                console.log(err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No schedule found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(schedule, meta));
            } else {
                console.log(response);
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(elasticService.parseResponse(response), meta));
            }
        });
    },

    findByDate: function (req, res, next) {
        console.log(req.body);
        var startTime = Date.now();
        var meta = {
            dataName: "schedules"
        };

        var range = req.body.date_range;

        var from_date = "now";
        var to_date = "now";
        if (range && range !== 'undefined') {
            from_date = range.start_date;
            to_date = range.end_date;
        }


        range = req.body.time_range;
        var start_time = "06:00";
        var end_time = "23:59";
        if (range && range !== 'undefined') {
            start_time = range.start_time;
            end_time = range.end_time;
        }

        console.log(from_date + " - " + to_date + " - " + start_time + " - " + end_time);

        auth.parseRequest(req, res);
        var schedule = {};
        var size = elasticService.PAGE_DATA_COUNT;
        //
        elastic.search({
            index: elasticService.INDEX_SCHEDULE,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                query: {
                    filtered: {
                        filter: {
                            and: {
                                filters: [
                                    {
                                        range : {
                                            date: {
                                                from: from_date,
                                                to: to_date
                                            }
                                        }
                                    },
                                    {
                                        term: {
                                            user_id: req.params.user_id
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                size: size,
                "sort": {"date": {"order": "desc"}},
                from: (req.body.page) ? req.body.page * size : 0
            }
        }, function (err, response) {
            if (err) {
                console.log(err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No schedule found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(schedule, meta));
            } else {
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(elasticService.parseResponse(response), meta));
            }
        });
    },

    countUserSchedule:  function(req, res){
        auth.parseRequest(req, res);
        elastic.count({
            index: elasticService.INDEX_SCHEDULE,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                query: {
                    match: {
                        user_id: req.params.user_id
                    }
                }
            }
        }, function (err, response) {
            console.log(err);
            if (err) {
                res.json({success: false, message: "Error encountered"});
            } else {
                res.json({success: true, count: response.count});
            }
        });
    }
};

module.exports = self;
