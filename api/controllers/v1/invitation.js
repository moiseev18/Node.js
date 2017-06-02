/**
 * Created by FEMI on 5/7/2016.
 */

var _ = require('underscore');
var service = require('../../routes/responses/service');
var async = require('async');
var elastic = require('../../../config/elastic');
var elasticService = require('../../services/ElasticService');

var self = {

    find: function (req, res) {
        var startTime = Date.now();
        var meta = {
            dataName: "invitations"
        };

        var invitation = {};
        var size = elasticService.PAGE_DATA_COUNT;

        elastic.search({
            index: elasticService.INDEX_INVITATION,
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
                meta.msg = "No invitation found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(invitation, meta));
            } else {
                invitation = response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(invitation, meta));
            }
        });
    },
    create: function (req, res, next) {

        var startTime = Date.now();
        var meta = {
            dataName: "invitation"
        };
        var data = req.body;
        console.log(data);
        elastic.create({
            index: elasticService.INDEX_INVITATION,
            type: elasticService.DOCUMENT_MAIN,
            body: data
        }, function (err, response) {
            if (err) {
                meta.statusCode = 503;
                meta.msg = "'cannot save invitation to elastic'";
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
            dataName: "invitations"
        };
        var invitation = {};

        elastic.get({
            index: elasticService.INDEX_INVITATION,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.invitation_id
        }).then(
            function (resp) {
                invitation = resp._source;
                invitation.id = resp._id;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(invitation, meta));
            },
            function (err) {
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No invitation found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(invitation, meta));
            }
        );
    },
    update: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "invitations"
        };
        var data = req.body;
        var invitation = {};
        elastic.update({
            index: elasticService.INDEX_INVITATION,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.invitation_id,
            body: {doc: data}
        }, function (err, response) {
            if (err) {
                console.trace(err.message);
                meta.statusCode = 404;
                meta.mssg = "Could not update invitation";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(invitation, meta));
            }
            else {
                console.log(response);
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Goals update successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                invitation.id = response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(invitation, meta));
            }
        })

    },

    destroy: function (req, res, next) {
        var startTime = Date.now();
        var meta = {
            dataName: "invitations"
        };

        console.log('id  : ', req.params.invitation_id);

        var invitation = {};

        elastic.delete({
            index: elasticService.INDEX_INVITATION,
            type: elasticService.DOCUMENT_MAIN,
            id: req.params.invitation_id
        }, function (err, response) {
            if (err) {
                console.log('err  : ', err);
                meta.extra = err.errors;
                meta.statusCode = 404;
                meta.msg = "No invitation found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(invitation, meta));
            }
            else {
                meta.statusCode = 200;
                meta.response = response;
                meta.mssg = "Goal deleted successfully";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                invitation.id = response._id;
                res.status(meta.statusCode).json(service.singleDataResponse(response, meta));
            }
        })
    },

    findByUser: function (req, res) {
        var startTime = Date.now();
        var meta = {
            dataName: "invitations"
        };

        var invitation = {};
        var size = elasticService.PAGE_DATA_COUNT;

        elastic.search({
            index: elasticService.INDEX_INVITATION,
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
                meta.msg = "No invitation found for your query";
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.status(meta.statusCode).json(service.singleDataResponse(invitation, meta));
            } else {
                console.log(response);
                invitation = response.hits;
                meta.statusCode = 200;
                meta.response_time = ((Date.now() - startTime) / 1000) + 's';
                res.json(200, service.singleDataResponse(invitation, meta));
            }
        });
    }
};
module.exports = self;
