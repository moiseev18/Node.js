/**
 * Created by FEMI on 5/7/2016.
 */

var _ = require('underscore');
var service = require('../../routes/responses/service');
var async = require('async');
var elastic = require('../../../config/elastic');
var elasticService = require('../../services/ElasticService');
var auth = require("../v1/auth");

var self = {
    TYPE: {
        SALES: "sales", CLIENTS: "clients", VISITS: "visits"
    },

    find: function (req, res) {
        var startTime = Date.now();
        var meta = {
            dataName: "goals"
        };

        var goal = {};
        var size = elasticService.PAGE_DATA_COUNT;

        elastic.search({
            index: elasticService.INDEX_GOALS,
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
                meta.msg = "No goal found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(goal, meta));
            } else {
                goal = response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(goal, meta));
            }
        });
    },
    create: function (req, res, next) {

        var startTime = Date.now();
        var meta = {
            dataName: "goal"
        };
        var data = req.body;
        console.log(data);
        elastic.create({
            index: elasticService.INDEX_GOALS,
            type: elasticService.DOCUMENT_MAIN,
            body: data
        }, function (err, response) {
            if (err) {
                meta.statusCode = 503;
                meta.msg = "'cannot save goal to elastic'";
                meta.extra = err.errors;
                res.status(meta.statusCode).json(service.generalResponse(meta));
            }
            else {
                console.log('response : ', data);
                data.id = response._id;
                meta.statusCode = 201;
                meta.response = response;
                meta.mssg = "Goal created successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(data, meta));
            }
        });
    },

    findById: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "goals"
        };
        var goal = {};

        elastic.get({
            index: elasticService.INDEX_GOALS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.goal_id
        }).then(
            function (resp) {
                goal = resp._source;
                goal.id = resp._id;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(goal, meta));
            },
            function (err) {
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No goal found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(goal, meta));
            }
        );
    },
    update: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "goals"
        };
        var data = req.body;
        var goal = {};
        elastic.update({
            index: elasticService.INDEX_GOALS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.goal_id,
            body: {doc: data}
        }, function (err, response) {
            if (err) {
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not update goal";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(goal, meta));
            }
            else {
                console.log(response);
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Goals update successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                goal.id = response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(goal, meta));
            }
        })

    },

    destroy: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "goals"
        };

        console.log('id  : ', req.params.goal_id);

        var goal = {};

        elastic.delete({
            index: elasticService.INDEX_GOALS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.goal_id
        }, function (err, response) {
            if (err) {
                console.log('err  : ', err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No goal found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(goal, meta));
            }
            else {
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Goal deleted successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                goal.id = response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(response, meta));
            }
        })
    },

    findByUser: function (req, res) {
        auth.parseRequest(req, res);
        var startTime = Date.now();
        var meta = {
            dataName: "goals"
        };

        var goal = {};
        var size = elasticService.PAGE_DATA_COUNT;

        elastic.search({
            index: elasticService.INDEX_GOALS,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                query: {
                    match: {
                        user_id: req.params.user_id
                    }
                },
                size: size,
                from: (req.params.page_number) ? req.params.page_number * size : 0
            }
        }, function (err, response) {
            if (err) {
                console.log(err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No goal found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(goal, meta));
            } else {
                console.log(response);
                goal = response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(elasticService.parseArrayResponse(response), meta));
            }
        });
    },
    findByDate: function (req, res) {
        auth.parseRequest(req, res);
        var startTime = Date.now();
        var meta = {
            dataName: "goals"
        };

        var goal = {};
        var size = elasticService.PAGE_DATA_COUNT;
        var DateFilter = null;

        if (typeof req.body.daterange !== 'undefined' && (typeof req.body.daterange.from !== 'undefined' || req.body.daterange.to !== 'undefined')) {
            DateFilter = {
                range: {
                    date: {
                        from: (req.body.daterange.from) ? req.body.daterange.from : "now",
                        to: (req.body.daterange.to) ? req.body.daterange.to : "now"
                    }
                }
            };

        } else if (typeof req.body.date !== 'undefined') {
            DateFilter = {
                term: {
                    date: req.body.date
                }
            };
        }

        console.log(DateFilter);

        if (DateFilter) {
            elastic.search({
                index: elasticService.INDEX_GOALS,
                type: elasticService.DOCUMENT_MAIN,
                body: {
                    query: {
                        filtered: {
                            filter: {
                                and: {
                                    filters: [
                                        DateFilter,
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
                    meta.msg = "No goal found for your query";
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    res.status(meta.statusCode).json(service.singleDataResponse(goal, meta));
                } else {
                    console.log(response);
                    goal = response.hits;
                    meta.statusCode = 200;
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    res.json(200, service.singleDataResponse(goal, meta));
                }
            });
        }
        else {
            meta.statusCode = 400;
            meta.mssg = "invalid post request format";
            return res.status(meta.statusCode).json(service.generalResponse(meta));
        }
    }

};
module.exports = self;
