/**
 * Created by Emmanuel on 5/10/2016.
 */
/**
 * Created by Emmanuel on 4/29/2016.
 */

var _ = require('underscore');
var service = require('../../routes/responses/service');
var async = require('async');
var elastic = require('../../../config/elastic');
var elasticService = require('../../services/ElasticService');
var auth = require("../v1/auth");

var self =  {

    find: function(req, res) {
        var startTime = Date.now();
        var meta = {
            dataName: "feeds"
        };

        var feed = {};
        var size = elasticService.PAGE_DATA_COUNT;
        auth.getUserLoggedIn(req);

        elastic.search({
            index: elasticService.INDEX_FEEDS,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                size: size,
                from: (req.params.page_number) ? req.params.page_number * size : 0
            }
        },function (err, response){
            if(err){
                console.log(err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No feed found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(feed,meta));
            }else{
                feed =  response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(feed, meta));
            }
        });
    },
    create: function (req, res, next) {

        var startTime = Date.now();
        var meta = {
            dataName: "feeds"
        };
        auth.getUserLoggedIn(req);
        var data = req.body;
        data.user_id=req.params.user_id;
        console.log(data);
        elastic.create({
            index: elasticService.INDEX_FEEDS,
            type: elasticService.DOCUMENT_MAIN,
            body: data
        }, function (err, response) {
            if(err) {
                meta.statusCode = 503;
                meta.msg = "'cannot save feed to elastic'";
                meta.extra = err.errors;
                res.status(meta.statusCode).json(service.generalResponse(meta));
            }
            else{
                console.log('response : ',data);
                data.id = response._id;
                meta.statusCode = 201;
                meta.response = response;
                meta.mssg = "Feed created successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(data, meta));
            }
        });
    },

    findById: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "feeds"
        };
        var feed = {};

        elastic.get({
            index: elasticService.INDEX_FEEDS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.feed_id
        }).then(
            function(resp) {
                feed =  resp._source;
                feed.id=resp._id;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(feed, meta));
            },
            function (err) {
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No feed found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(feed,meta));
            }
        );
    },
    update: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "feeds"
        };
        auth.getUserLoggedIn(req);
        var data = req.body;
        delete data.user_id;
        var feed = {};
        elastic.update({
            index: elasticService.INDEX_FEEDS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.feed_id,
            body: {doc: data }
        }, function (err, response) {
            if(err){
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not update feed";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(feed,meta));
            }
            else{
                console.log(response);
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Lines update successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                feed.id=response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(feed, meta));
            }
        })

    },

    destroy: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "feeds"
        };

        auth.getUserLoggedIn(req);
        console.log('id  : ',req.params.feed_id);

        var feed = {};

        elastic.delete({
            index: elasticService.INDEX_FEEDS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.feed_id
        }, function (err, response) {
            if(err) {
                console.log('err  : ',err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No feed found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(feed,meta));
            }
            else{
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Line deleted successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                feed.id=response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(response, meta));
            }
        })
    },

    findByUser: function(req, res){
        var startTime = Date.now();
        var meta = {
            dataName: "feeds"
        };
        auth.getUserLoggedIn(req);
        var feed = {};
        var size = elasticService.PAGE_DATA_COUNT;

        elastic.search({
            index: elasticService.INDEX_FEEDS,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                query: {
                    match : {
                        user_id: req.params.user_id
                    }
                },
                size: size,
                from: (req.params.page_number) ? req.params.page_number * size : 0
            }
        },function (err, response){
            if(err){
                console.log(err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No feed found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(feed,meta));
            }else{
                console.log(response);
                feed =  response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(feed, meta));
            }
        });
    },
    findByDate : function(req, res, next){

        var startTime = Date.now();
        var meta = {
            dataName: "feeds"
        };

        auth.getUserLoggedIn(req);
        var feed = {};
        var size = elasticService.PAGE_DATA_COUNT;
        var DateFilter = null;

        if(typeof req.body.daterange !== 'undefined' && (typeof req.body.daterange.from !== 'undefined' || req.body.daterange.to !== 'undefined')){
            DateFilter = {
                range : {
                    date: {
                        from: (req.body.daterange.from) ? req.body.daterange.from : "now",
                        to: (req.body.daterange.to) ? req.body.daterange.to : "now"
                    }
                }
            };

        }else if(typeof req.body.date !== 'undefined') {
            DateFilter = {
                term: {
                    date: req.body.date
                }
            };
        }

        console.log(DateFilter);

        if(DateFilter){
            elastic.search({
                index: elasticService.INDEX_FEEDS,
                type: elasticService.DOCUMENT_MAIN,
                body: {
                    query: {
                        filtered: {
                            filter: {
                                and: {
                                    filters : [
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
                    "sort": { "date": { "order": "desc" }},
                    from: (req.body.page) ? req.body.page * size : 0
                }
            },function (err, response){
                if(err){
                    console.log(err);
                    meta.extra = err.errors;
                    meta.statusCode = 404;
                    meta.msg = "No feed found for your query";
                    meta.response_time = ((Date.now() - startTime)/1000)+'s';
                    res.status(meta.statusCode).json(service.singleDataResponse(feed,meta));
                }else{
                    console.log(response);
                    feed =  response.hits;
                    meta.statusCode = 200;
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    res.json(200, service.singleDataResponse(feed, meta));
                }
            });
        }
        else
        {
            meta.statusCode = 400;
            meta.mssg = "invalid post request format";
            return res.status(meta.statusCode).json(service.generalResponse(meta));
        }
    }
};

module.exports = self;
