/**
 * Created by FEMI on 4/27/2016.
 */


var _ = require('underscore');
var service = require('../../routes/responses/service');
var elastic = require('../../../config/elastic');
var elasticService = require('../../services/ElasticService');
var auth = require("../v1/auth");
var env = require('../../../config/envs');
var version = env.apiVersion;

var self =  {


    create: function (req, res, next) {
        console.log('body', req.body);
        auth.parseRequest(req,res);
        var startTime = Date.now();
        var meta = {
            dataName: "client"
        };

        var client=req.body;

        if(req.body.client){
            client = req.body.client.replace(/\\/g, "");
            client = JSON.parse(client);
            console.log('client', client.address);
        }

        client.user_id = req.params.user_id;
        client.logo = (req.file?(req.file.filename):"");
        try {
            client.address.coordinate = {
                lat: parseFloat(req.body.address.coordinate.lat), lon: parseFloat(req.body.address.coordinate.lon)
            }
        }catch(e) {

        }

        elastic.create({
            index: elasticService.INDEX_CLIENT,
            type: elasticService.DOCUMENT_MAIN,
            body: client
        }, function (err, response) {
            if(err) console.log('cannot save client to elastic', err);
            else{
                meta.statusCode = 201;
                meta.response = response;
                meta.mssg = "Client created successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                client.id=response._id;
                client.logo=(client.logo==""?"":global.get_uri('logo/'+client.logo, req));
                res.status(meta.statusCode).json(service.singleDataResponse(client, meta));
            }
        });
    },

    findById: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "client"
        };
        auth.getUserLoggedIn(req,res);
        // console.log("femiiiiiiiiiiii", req.headers.host);
        elastic.get({
            index: elasticService.INDEX_CLIENT,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.client_id
        }).then(
            function(resp) {
                console.log(resp);
                client =  resp._source;
                client.id=resp._id;
                client.logo= (client.logo==""?"":global.get_uri('logo/'+client.logo, req));
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(client, meta));

            },
            function (err) {
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "No user found for your query";
                client = {};
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(client,meta));

            }
        );
    },
    findByIds: function (client_ids, callback) {

      //  auth.getUserLoggedIn(req,res);
        // console.log("femiiiiiiiiiiii", req.headers.host);
        //console.log(client_ids)
        elastic.search({
            index: elasticService.INDEX_CLIENT,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                //fields : ["_id", "coworker_id"],
                query: {
                   ids: {
                        values: client_ids
                    }
                }
            }
        },
            function(err, response) {
                var clients=[]
                if(response.hits) {
                    var hits = response.hits.hits;
                    console.log(response.hits)
                    var len = hits.length;
                    for (var i = 0; i < len; i++) {
                        delete hits[i]["_index"];
                        delete hits[i]._type;
                        id=hits[i]._id;
                        delete hits[i]._id;
                        score=hits[i]._score;
                        clients[id]=(hits[i]);
                    }
                }
              callback(err, clients)

            }
        );
    },


    update: function (req, res) {
        console.log("the body", req.body);
        var startTime = Date.now();
        var meta = {
            dataName: "client"
        };
        auth.parseRequest(req,res);
        client=req.body;
        client.logo=   (req.file?(req.file.filename):"");
        delete client.user_id;

        console.log("client body", client);

        /*Object.keys(req.body).forEach(function(key) {
         var val = req.body[key];
         if(key!='token' && key!='lat' && key!='lon') {
         client[key]=val;
         }
         });*/

        console.log("the client", client);
        elastic.update({
            index: elasticService.INDEX_CLIENT,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.client_id,
            body: {doc: client }
        }, function (err, response) {
            if(err){
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not update client";
                client = {};
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(client,meta));
            }
            else{
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Client update successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                client.id=response._id;
                //client.logo=(client.logo==""?"":global.get_uri('logo/'+client.logo, req));
                res.status(meta.statusCode).json(service.singleDataResponse(client, meta));
            }
        })


    },

    destroy: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "users"
        };
        auth.getUserLoggedIn(req, res);
        elastic.delete({
            index: elasticService.INDEX_CLIENT,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.client_id
        }, function (err, response) {
            if(err) {
                //console.log('cannot delete client', err);
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "No client found for your query";
                client = {};
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(client,meta));
            }
            else{
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Client deleted successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                // client.id=response._id;
                //client.logo=(client.logo==""?"":global.get_uri('logo/'+client.logo, req));
                res.status(meta.statusCode).json(service.singleDataResponse(response, meta));
            }
        })
    },

    findByUserWithRevenue: function(req, res, next) {
        req.body.get_total_revenues="yes";
        self.findByUser(req, res, next)

    },
    findByUser: function(req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "clients"
        };
        auth.parseRequest(req,res);

        var size = elasticService.PAGE_DATA_COUNT;
        elastic.search({
            index: elasticService.INDEX_CLIENT,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                query: {
                    match: {
                        user_id: req.params.user_id
                    }
                },
                size: size,
                from: (req.params.page_number) ? (parseInt(req.params.page_number)-1) * size : 0
            }
        }, function (err, response) {
            if(err){
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not find users clients";
                client = {};
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(client,meta));
            }
            else{
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                //var obj = elasticService.parseArrayResponseAsObject(response);
               // console.log("*****************************************************************************************************************************", response)
                if(req.body.get_total_revenues && req.body.get_total_revenues!="") {
                    //return self.getTotalRevenues(obj, res)
                    //res.json(200, service.singleDataResponse(obj.result, meta));
                    res.status(meta.statusCode).json(service.singleDataResponse(elasticService.parseArrayResponse(response, global.get_uri('logo/', req)), meta));

                }else {
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    //res.status(meta.statusCode).json(response);
                    res.status(meta.statusCode).json(service.singleDataResponse(elasticService.parseArrayResponse(response, global.get_uri('logo/', req)), meta));

                }
            }
        })
    },

    findByUserAndSchedule: function(req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "clients"
        };
        auth.parseRequest(req,res);

        var size = elasticService.PAGE_DATA_COUNT;
        elastic.search({
            index: elasticService.INDEX_CLIENT,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                query: {
                    match: {
                        user_id: req.params.user_id
                    }
                },
                size: size,
                from: (req.params.page_number) ? (parseInt(req.params.page_number)-1) * size : 0
            }
        }, function (err, response) {
            if(err){
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not find users clients";
                client = {};
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(client,meta));
            }
            else{
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(elasticService.parseArrayResponse(response, global.get_uri('logo/', req)), meta));
            }
        })
    },

    findByDistance: function(req, res) {
        console.log(req.body);
        var startTime = Date.now();
        var meta = {
            dataName: "clients"
        };
        auth.parseRequest(req,res);

        var distance = req.body.distance;
        var location = req.body.location;
        if(!location){
            location =  {
                "lat": 0.0,
                "lon": 0.0
            }
        }

        if(!distance){
            distance = "10000km";
        }

        var size = elasticService.PAGE_DATA_COUNT;
        elastic.search({
            index: elasticService.INDEX_CLIENT,
            type: elasticService.DOCUMENT_MAIN,
            body: {
                query: {
                    filtered: {
                        query: {
                            match: {
                                user_id: req.params.user_id
                            }
                        }
                        //filter: {
                        //    geo_distance : {
                        //        distance : distance,
                        //        coordinate : location
                        //    }
                        //}
                    }
                },
                size: size,
                "sort" : [
                    {
                        "_geo_distance" : {
                            "coordinate" : location,
                            "order" : "asc",
                            "unit" : "km"
                        }
                    }
                ],
                from: (req.body.page) ? req.body.page * size : 0
            }
        }, function (err, response) {
            if(err){
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not find users clients";
                client = {};
                meta.response_time = ((Date.now() - startTime)/1000)+'s';
                res.status(meta.statusCode).json(service.singleDataResponse(client,meta));
            }
            else{
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                //res.status(meta.statusCode).json(response);
                res.status(meta.statusCode).json(service.singleDataResponse(elasticService.parseArrayResponse(response, global.get_uri('logo/', req)), meta));
            }
        })
    },

    findByDateLastVisited: function(req, resp, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "clients"
        };

        auth.getUserLoggedIn(req, res);
        var clients = {};

        var size = elasticService.PAGE_DATA_COUNT;
        var DateFilter = null;
        console.log(req.body);
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
                range: {
                    last_visited: {
                        lt: req.body.date
                    }
                }
            };
        }


        if (DateFilter) {
            elastic.search({
                index: elasticService.INDEX_CLIENT,
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
                    "sort": {"last_visited": {"order": "desc"}},
                    from: (req.body.page) ? req.body.page * size : 0
                }
            }, function (err, response) {
                if (err) {
                    console.log(err);
                    meta.extra = err.errors;
                    meta.statusCode = 404;
                    meta.msg = "No clients found for your query";
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    resp.status(meta.statusCode).json(service.singleDataResponse(clients, meta));
                } else {
                    console.log(response);
                    // goal = response.hits;
                    meta.statusCode = 200;
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                    var obj = elasticService.parseArrayResponse(response);
                    if(req.body.get_total_revenues && req.body.get_total_revenues==1) {
                        return self.getTotalRevenues(obj)
                    }else {
                        resp.json(200, service.singleDataResponse(obj.result, meta));
                    }
                }
            });
        }
        else {
            meta.statusCode = 400;
            meta.mssg = "invalid post request format";
            return resp.status(meta.statusCode).json(service.generalResponse(meta));
        }

    },
    countUserClient: function(req, res){
        auth.parseRequest(req, res);
        elastic.count({
            index: elasticService.INDEX_CLIENT,
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

    },
    getTotalRevenues: function(objOfClientsAndIDs, resp) {
        var startTime = Date.now();
        var ids=objOfClientsAndIDs.ids;
        var clients=objOfClientsAndIDs.result;
        console.log("*************************************************************************************************************************************", objOfClientsAndIDs)
        elastic.search({
                index: elasticService.INDEX_REVENUE,
                type: elasticService.DOCUMENT_MAIN,
                body: {
                    //fields : ["_id", "coworker_id"],
                    query: {
                        constant_score: {
                            filter : {
                                terms : {
                                    client_id : ids
                                }
                            }
                        }
                    }
                    ,
                    aggs: {
                        by_client: {
                            terms: {
                                field: "client_id"
                            },
                            aggs: {
                                total_revenue: {sum: {field: "value"}}
                            }
                        }
                    }
                }
            },
            function(err, response) {
                console.log(response)
                var meta={}
                var clients=[]
                if(!err) {
                    var hits = response.hits.hits;
                    console.log(response.hits)
                    var len = hits.length;
                    for (var i = 0; i < len; i++) {

                        id=hits[i]._id;

                        score=hits[i]._score;

                    }
                    var obj = elasticService.parseArrayResponse(response);
                    meta.statusCode = 503;
                    meta.response_time = ((Date.now() - startTime) / 1000) + 's';

                    resp.json(200, service.singleDataResponse(obj.result, meta));

                    return;
                }
                else console.log(err)
                meta.statusCode = 503;
                meta.mssg = "invalid post request format";
                return resp.status(meta.statusCode).json(service.generalResponse(meta));


            }
        );
    }
};

module.exports = self;
