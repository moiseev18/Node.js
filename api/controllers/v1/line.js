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
            dataName: "lines"
        };

        var line = {};
        var size = elasticService.PAGE_DATA_COUNT;
        //auth.getUserLoggedIn(req);

        elastic.search({
            index: elasticService.INDEX_LINE,
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
                meta.msg = "No line found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(line,meta));
            }else{
                line =  response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(line, meta));
            }
        });
    },
        create: function (req, res, next) {

            var startTime = Date.now();
            var meta = {
                dataName: "line"
            };
            auth.getUserLoggedIn(req);
            var data = req.body;
            data.user_id=req.params.user_id;
            console.log(data);
            //data.address.coordinate.lat = parseFloat(data.address.coordinate.lat);
            //data.address.coordinate.lon = parseFloat(data.address.coordinate.lon);
            elastic.create({
                index: elasticService.INDEX_LINE,
                type: elasticService.DOCUMENT_MAIN,
                body: data
            }, function (err, response) {
                if(err) {
                    meta.statusCode = 503;
                    meta.msg = "'cannot save line to elastic'";
                    meta.extra = err.errors;
                    res.status(meta.statusCode).json(service.generalResponse(meta));
                }
                else{
                    self.addRevenues(req.params.user_id, response._id,"AMOUNT FROM PREVIOUS SALES", function(err, succcess) {
                        console.log('response : ',data);
                        data.id = response._id;
                        meta.statusCode = 201;
                        meta.response = response;
                        meta.mssg = "Line created successfully";
                        meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                        res.status(meta.statusCode).json(service.singleDataResponse(data, meta));
                    })

                }
            });
        },

    findById: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "lines"
        };
        var line = {};

        elastic.get({
            index: elasticService.INDEX_LINE,
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
                meta.msg = "No line found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(line,meta));
            }
        );
    },

    update: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "line"
        };
        var data = req.body;
        var line = {};
        auth.getUserLoggedIn(req);
        delete data.user_id;
        elastic.update({
            index: elasticService.INDEX_LINE,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.line_id,
            body: {doc: data }
        }, function (err, response) {
            if(err){
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not update line";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(line,meta));
            }
            else{
                console.log(response);
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Lines update successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                line.id=response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(line, meta));
            }
        })

    },

    destroy: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "lines"
        };
        auth.getUserLoggedIn(req);
        console.log('id  : ',req.params.line_id);

        var line = {};

        elastic.delete({
            index: elasticService.INDEX_LINE,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.line_id
        }, function (err, response) {
            if(err) {
                console.log('err  : ',err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No line found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(line,meta));
            }
            else{
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Line deleted successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                line.id=response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(response, meta));
            }
        })
    },

    findByUser: function(req, res){
        var startTime = Date.now();
        var meta = {
            dataName: "lines"
        };
        auth.getUserLoggedIn(req);

        var line = {};
        var size = elasticService.PAGE_DATA_COUNT;

        elastic.search({
            index: elasticService.INDEX_LINE,
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
                meta.msg = "No line found for your query";
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(line,meta));
            }else{
                console.log(response);
                //line =  response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(elasticService.parseArrayResponse(response, global.get_uri('logo/', req)), meta));
                //res.json(200, service.singleDataResponse(line, meta));
            }
        });
    },
    addRevenues: function(userId, lineId, title, callback) {
        /*  bulk=[]
         bulk.put( { index:  { _index: 'myindex', _type: 'mytype', _id: 1 } })
         bulk.put({user_id:userId, line_id:lineId, title:value:0.00, created:Date.now()})*/
        data={title:title, user_id:userId, line_id:lineId, value:0.00, created:elasticService.getCurrentDateTime()}
        elastic.create({
            index: elasticService.INDEX_REVENUE,
            type: elasticService.DOCUMENT_MAIN,
            body: data
        }, function (err, response) {
            callback(err, response);
        });
    }
};

module.exports = self;
