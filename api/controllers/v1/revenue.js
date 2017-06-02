/**
 * Created by Femi on 7/28/2016.
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
            dataName: "revenues"
        };

        var revenue = {};
        var size = elasticService.PAGE_DATA_COUNT;
        auth.getUserLoggedIn(req);

        elastic.search({
            index: elasticService.INDEX_REVENUE,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                size: size,
                from: elasticService.getPageNumber(req, size)
            }
        },function (err, response){
            if(err){
                console.log(err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No revenue found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(revenue,meta));
            }else{
                revenue =  response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(elasticService.parseArrayResponse(response), meta));
            }
        });
    },
    add: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "revenue"
        };
        auth.getUserLoggedIn(req);
        var data = req.body;
        data.user_id=""+req.params.user_id;
        console.log(data);
        //data.address.coordinate.lat = parseFloat(data.address.coordinate.lat);
        //data.address.coordinate.lon = parseFloat(data.address.coordinate.lon);
        var httpResp=res;
        var revenue={};
                var meta = {
                    dataName: "revenue"
                };
                    elastic.create({
                        index: elasticService.INDEX_REVENUE,
                        type: elasticService.DOCUMENT_MAIN,
                        body: data
                    }, function (err, response) {
                        if(err) {
                            meta.statusCode = 503;
                            meta.msg = "'cannot add revenue'";
                            meta.extra = err.errors;
                            httpResp.status(meta.statusCode).json(service.generalResponse(meta));
                        }
                        else{
                            console.log('response : ',data);
                            data.id = response._id;
                            meta.statusCode = 201;
                            meta.response = response;
                            meta.mssg = "Revenue added successfully";
                            meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                            httpResp.status(meta.statusCode).json(service.singleDataResponse(data, meta));
                        }
                    });

    },

    findById: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "revenues"
        };
        auth.getUserLoggedIn(req);
        var revenue = {};

        elastic.get({
            index: elasticService.INDEX_REVENUE,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.revenue_id
        }).then(
            function(resp) {
                revenue =  resp._source;
                revenue.id=resp._id;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(revenue, meta));
            },
            function (err) {
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No revenue found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(revenue,meta));
            }
        );
    },

    update: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "revenues"
        };
        auth.getUserLoggedIn(req);
        var data = req.body;
        delete data.user_id;
        var revenue = {};
        elastic.update({
            index: elasticService.INDEX_REVENUE,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.revenue_id,
            body: {doc: data }
        }, function (err, response) {
            if(err){
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not update revenue";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(revenue,meta));
            }
            else{
                console.log(response);
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "revenue update successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                revenue.id=response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(revenue, meta));
            }
        })
    },

    destroy: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "revenue"
        };
        auth.getUserLoggedIn(req);
        console.log('id  : ',req.params.revenue_id);

        var revenue = {};

        elastic.delete({
            index: elasticService.INDEX_REVENUE,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.revenue_id
        }, function (err, response) {
            if(err) {
                console.log('err  : ',err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No revenue found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(revenue,meta));
            }
            else{
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "revenue deleted successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                revenue.id=response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(response, meta));
            }
        })
    },

    findByUserId: function(req, res){
        var startTime = Date.now();
        var meta = {
            dataName: "revenues"
        };
        auth.getUserLoggedIn(req);
        var revenue = {};
        var size = elasticService.PAGE_DATA_COUNT;
        var request=req;
        elastic.search({
            index: elasticService.INDEX_REVENUE,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                //fields : ["_id", "revenue_id"],
                query: {
                    bool : {
                        must: [
                            {
                                term: {
                                    user_id: req.params.user_id
                                }

                            }

                        ]

                    }
                },
                size: size,
                from: elasticService.getPageNumber(req, size)
            }
        },function (err, response){
            if(err){
                console.log(err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No revenue found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(revenue,meta));
            }else{
                console.log(response);

                revenue =  response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                //res.status(status).json(obj)
                res.status(200).json( service.singleDataResponse(elasticService.parseArrayResponse(response), meta));
            }
        });
    },

    findByUserLine: function(req, res){
        var startTime = Date.now();
        var meta = {
            dataName: "revenues"
        };
        auth.getUserLoggedIn(req);
        var revenue = {};
        var size = elasticService.PAGE_DATA_COUNT;
        var request=req;
        elastic.search({
            index: elasticService.INDEX_REVENUE,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                //fields : ["_id", "revenue_id"],
                query: {
                    match : {
                        line_id: req.params.line_id
                    }
                },
                size: size,
                "sort": {"date_sold": {"order": "desc"}},
                from: elasticService.getPageNumber(req, size)
            }
        },function (err, response){
            if(err){
                console.log(err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No revenue found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(revenue,meta));
            }else{

               // revenue =  response.hits;
             //   console.log(elasticService.parseArrayResponse(response));

                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                //res.status(status).json(obj)
                respObj=elasticService.parseArrayResponse(response)
                console.log("response", respObj)
                res.status(200).json( service.singleDataResponse(respObj, meta));
            }
        });
    },

    revenues_exist: function(req, resp, success_callback, error_callback, checkIfIsVerified) {
        elastic.search({
            index: elasticService.INDEX_REVENUE,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                size: 1,
                query: {
                    bool: {
                        should : [
                            {
                                bool: {
                                    must: [
                                        {
                                            match: {
                                                user_id: req.params.user_id
                                            }
                                        },
                                        {
                                            match: {
                                                revenue_id: (req.params.revenue_id?req.params.revenue_id:req.body.revenue_id)
                                            }
                                        }
                                    ]

                                }
                            },
                            {
                                bool: {
                                    must: [
                                        {
                                            match: {
                                                user_id: (req.params.revenue_id?req.params.revenue_id:req.body.revenue_id)
                                            }
                                        },
                                        {
                                            match: {
                                                revenue_id: req.params.user_id
                                            }
                                        }
                                    ]

                                }
                            },
                        ],
                        "minimum_should_match": 1
                    }

                },
                filter: ((checkIfIsVerified)?{
                    term: {
                        verified: true
                    }
                }:{})
            }
        },function (err, response){
            if(err){
                error_callback(err)
            }else{
                success_callback(response)
            }
        })
    }
};

module.exports = self;
