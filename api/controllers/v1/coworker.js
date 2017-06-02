/**
 * Created by FEMI on 5/7/2016.
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
            dataName: "coworkers"
        };

        var line = {};
        var size = elasticService.PAGE_DATA_COUNT;
        auth.getUserLoggedIn(req);

        elastic.search({
            index: elasticService.INDEX_COWORKERS,
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
                meta.msg = "No coworker found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(line,meta));
            }else{
                line =  response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(elasticService.parseArrayResponse(response), meta));
            }
        });
    },
    add: function (req, res, next) {

        var startTime = Date.now();
        var meta = {
            dataName: "coworkers"
        };
        auth.getUserLoggedIn(req);
        var data = req.body;
        data.user_id=""+req.params.user_id;

        if(data.user_id==data.coworker_id) {
            //meta.extra = err.errors;
            meta.statusCode = 503;
            meta.msg = "user can not be same as coworker";
            meta.response_time = ((Date.now() - startTime)/1000)+'s';
            res.status(meta.statusCode).json(service.generalResponse(meta));
            return;
        }
        console.log(data);
        //data.address.coordinate.lat = parseFloat(data.address.coordinate.lat);
        //data.address.coordinate.lon = parseFloat(data.address.coordinate.lon);
        var httpResp=res;
        var line={};
        self.coworkers_exist(req, res,

            function(response) {

               var cw= elasticService.parseArrayResponse(response);
                console.log("cw", cw);
                var meta = {
                    dataName: "coworkers"
                };

                if(cw.length==0) {

                    elastic.create({
                        index: elasticService.INDEX_COWORKERS,
                        type: elasticService.DOCUMENT_MAIN,
                        body: data
                    }, function (err, response) {
                        if(err) {
                            meta.statusCode = 503;
                            meta.msg = "'cannot add coworkers to elastic'";
                            meta.extra = err.errors;
                            httpResp.status(meta.statusCode).json(service.generalResponse(meta));
                        }
                        else{
                            console.log('response : ',data);
                            data.id = response._id;
                            meta.statusCode = 201;
                            meta.response = response;
                            meta.mssg = "Coworker added successfully";
                            meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                            httpResp.status(meta.statusCode).json(service.singleDataResponse(data, meta));
                        }
                    });
                }else{
                    console.log('response : ',data);
                    data.id = response._id;
                    meta.statusCode = 501;
                    meta.response = response;
                    meta.mssg = "coworker already exists";
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    httpResp.status(meta.statusCode).json(service.singleDataResponse(data, meta));
                }

            },
            function(err, res) {
                console.log(err);
                var meta = {
                    dataName: "coworkers"
                };
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No coworkers found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                httpResp.status(meta.statusCode).json(service.singleDataResponse(line, meta));
            }

        )

    },

    findById: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "lines"
        };
        auth.getUserLoggedIn(req);
        var line = {};

        elastic.get({
            index: elasticService.INDEX_COWORKERS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.line_id
        }).then(
            function(resp) {
                line =  resp._source;
                line.id=resp._id;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(line, meta));
            },
            function (err) {
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No coworker found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(line,meta));
            }
        );
    },

    update: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "coworkers"
        };
        auth.getUserLoggedIn(req);
        var data = req.body;
        delete data.user_id;
        var line = {};
        elastic.update({
            index: elasticService.INDEX_COWORKERS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.coworker_id,
            body: {doc: data }
        }, function (err, response) {
            if(err){
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not update coworkers";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(line,meta));
            }
            else{
                console.log(response);
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "coworker update successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                line.id=response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(line, meta));
            }
        })

    },

    destroy: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "coworker"
        };
        auth.getUserLoggedIn(req);
        console.log('id  : ',req.params.coworker_id);

        var line = {};

        elastic.delete({
            index: elasticService.INDEX_COWORKERS,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.coworker_id
        }, function (err, response) {
            if(err) {
                console.log('err  : ',err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No coworker found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(line,meta));
            }
            else{
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "coworker deleted successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                line.id=response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(response, meta));
            }
        })
    },

    findByUserId: function(req, res){
        var startTime = Date.now();
        var meta = {
            dataName: "coworkers"
        };
        auth.getUserLoggedIn(req);
        var line = {};
        var size = elasticService.PAGE_DATA_COUNT;
        var request=req;
        elastic.search({
            index: elasticService.INDEX_COWORKERS,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                //fields : ["_id", "coworker_id"],
                query: {
                    bool : {
                        should: [
                            {
                                term: {
                                    user_id: req.params.user_id
                                }

                            },
                            {
                                term: {
                                    coworker_id: req.params.user_id
                                }

                            }

                        ],
                        "minimum_should_match": 1
                    }
                },
                filter: {
                    term: {
                        verified: true
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
                meta.msg = "No coworker found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(line,meta));
            }else{
                console.log(response);
               /* var hits=response.hits.hits;
                console.log(response.hits)
                var len = hits.length;
                var rsl=[];
                var user_id=request.params.user_id;
                for (var i=0; i<len; i++) {
                    var cw;
                   if(hits[i].user_id==user_id) {
                       cw=hits[i].coworker_id;
                   }else{
                       cw=hits[i].user_id;
                   }
                    var ii= i, length=len;
                   elasticService.findById(cw, elasticService.INDEX_USERS, null, function(response) {
                       rsl.push(response)
                       if(ii==length-1) {
                           var meta = {
                               dataName: "coworkers"
                           };
                            line =  rsl;
                            meta.statusCode = 200;
                           meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                           response.json(200, service.singleDataResponse(rsl, meta));

                       }
                   }, function(error){

                   })


                }
                console.log("Result", rsl);*/
                line =  response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                //res.status(status).json(obj)
                res.status(200).json( service.singleDataResponse(elasticService.parseArrayResponse(response), meta));
            }
        });
    },
    areCoworkers: function(req, res){
        var startTime = Date.now();


        var line = {};
       // var size = elasticService.PAGE_DATA_COUNT;
        var httpResp=res;
        auth.getUserLoggedIn(req);
        self.coworkers_exist(req, res,

            function(response, res) {
                console.log(response);
                coworkers =  response.hits;
                var meta = {
                    dataName: "coworkers"
                };
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                httpResp.json(200, service.singleDataResponse(elasticService.parseArrayResponse(response), meta));

            },
        function(err, res) {
            console.log(err);
            var meta = {
                dataName: "coworkers"
            };
            meta.extra = err.errors;
            meta.statusCode = 404;
            meta.msg = "No coworkers found for your query";
            meta.response_time = ((Date.now() - startTime)/1000)+'s';
            httpResp.status(meta.statusCode).json(service.singleDataResponse(line, meta));
        }, true

        );
    },
    coworkers_exist: function(req, resp, success_callback, error_callback, checkIfIsVerified) {
        elastic.search({
            index: elasticService.INDEX_COWORKERS,
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
                                                coworker_id: (req.params.coworker_id?req.params.coworker_id:req.body.coworker_id)
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
                                                user_id: (req.params.coworker_id?req.params.coworker_id:req.body.coworker_id)
                                            }
                                        },
                                        {
                                            match: {
                                                coworker_id: req.params.user_id
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
