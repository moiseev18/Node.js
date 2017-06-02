/**
 * Created by Emmanuel on 4/16/2016.
 */

var elastic = require('../../config/elastic');

var INDEX = elastic.INDEX = "tied";
var INDEX_USERS = elastic.INDEX_USERS = "tied_users";
var INDEX_LINE = elastic.INDEX_LINE = "tied_lines";
var INDEX_CLIENT = elastic.INDEX_CLIENT = "tied_clients";
var INDEX_SCHEDULE = elastic.INDEX_SCHEDULE = "tied_schedules";
var INDEX_COWORKERS = elastic.INDEX_SCHEDULE = "tied_coworkers";
var INDEX_GOALS = elastic.INDEX_SCHEDULE = "tied_goals";
var INDEX_FEEDS = elastic.INDEX_SCHEDULE = "tied_feeds";
var INDEX_ACHIEVEMENTS = elastic.INDEX_SCHEDULE = "tied_achievements";
var INDEX_INVITATION = elastic.INDEX_INVITATION = "tied_invitations";
var INDEX_REVENUE = elastic.INDEX_REVENUE = "tied_revenue";


var DOCUMENT_MAIN = "data";


var PAGE_DATA_COUNT = 10;

module.exports = {

    INDEX: INDEX,
    INDEX_USERS: INDEX_USERS,
    INDEX_LINE: INDEX_LINE,
    INDEX_CLIENT: INDEX_CLIENT,
    INDEX_SCHEDULE: INDEX_SCHEDULE,
    DOCUMENT_MAIN:DOCUMENT_MAIN,
    PAGE_DATA_COUNT:PAGE_DATA_COUNT,
    INDEX_COWORKERS : INDEX_COWORKERS,
    INDEX_GOALS : INDEX_GOALS,
    INDEX_FEEDS : INDEX_FEEDS,
    INDEX_ACHIEVEMENTS : INDEX_ACHIEVEMENTS,
    INDEX_INVITATION : INDEX_INVITATION,
    INDEX_REVENUE : INDEX_REVENUE,

    ping: function () {
        elastic.ping({
            // ping usually has a 3000ms timeout
            requestTimeout: Infinity,
            hello: "elasticsearch!"
        }, function (error) {
            if (error) {
                console.trace('elasticsearch cluster is down!');
            } else {
                console.log('All is well');
            }
        });
    },
    deleteIndex: function (indexName) {
        return elastic.indices.delete({
            index: indexName
        });
    },
    deleteAlias: function (alias) {
        return elastic.indices.deleteAlias({
            name: alias
        });
    },

    putMapping :function(index, type, body){
        return elastic.indices.putMapping({
            index: index,
            type: type,
            body: body
        }).then(function (result) {
            console.log('create mapping', result);
        }).catch(function (err) {
            console.log('could not putMapping ',index, body, err);
        });
    },

    initIndex: function (index, version, body) {
        var index=index;
        var newIndex = index + "_v" + version;
        return elastic.indices.exists({index: newIndex})
            .then(function (exist) {
                if (!exist) {
                    return elastic.indices.create({
                        index: newIndex
                    }).then(function (result) {
                        console.log('create an index', result);
                        return elastic.indices.putMapping({
                            index: newIndex,
                            type: DOCUMENT_MAIN,
                            body: body
                        }).then(function (result) {
                            console.log('create mapping', result);
                            return elastic.indices.putAlias({
                                index: newIndex,
                                name: index
                            }).then(function (result) {
                                console.log('create putAlias', result);
                            }).catch(function (err) {
                                console.log('could not putAlias ', err);
                            });
                        }).catch(function (err) {
                            console.log('could not putMapping ',index, body, err);
                        });
                    }).catch(function (err) {
                        console.log('could not create an index ', err);
                    });
                } else {
                   // $(this).deleteAlias(index);
                   // $(this).deleteIndex("tied_users_v1");

                    console.log('index already exist ', newIndex);
                }
            });
    },
    add: function addDocument(indexName, document, type) {
        return elasticClient.index({
            index: indexName,
            type: (type==null?elastic.DOCUMENT_MAIN:type),
            body: document
        });
    },
    parseArrayResponse: function (response, image_directory) {

        var rsl=[];
        if(!response.hits) return rsl;
        var hits=response.hits.hits;
        console.log(response.hits)
        var len = hits.length;

        for (var i=0; i<len; i++) {
            delete hits[i]["_index"];
            delete hits[i]._type;

            score=hits[i]._score;
            source=hits[i]._source;
            sort = hits[i].sort

            id=hits[i]._id;
            hits[i]=source;
            hits[i].id=id;
            hits[i]._score=score;
            if(sort){
                hits[i]._score=sort;
            }
            if(hits[i].logo && image_directory!=null) {
                hits[i].logo = (hits[i].logo == "" ? "" : image_directory + hits[i].logo);
            }
            if(hits[i].avatar && image_directory!=null) {
                hits[i].avatar = (hits[i].avatar == "" ? "" : image_directory + hits[i].avatar);
            }
            rsl.push(hits[i])

        }
        return rsl;
    },
    parseArrayResponseAsObject: function (response, image_directory) {

        var rsl=[];
        var ids=[]
        if(!response.hits) return rsl;
        var hits=response.hits.hits;
        console.log(response.hits)
        var len = hits.length;

        for (var i=0; i<len; i++) {
            delete hits[i]["_index"];
            delete hits[i]._type;

            score=hits[i]._score;
            source=hits[i]._source;
            sort = hits[i].sort

            id=hits[i]._id;
            hits[i]=source;
            hits[i].id=id;
            hits[i]._score=score;
            if(sort){
                hits[i]._score=sort;
            }
            if(hits[i].logo && image_directory!=null) {
                hits[i].logo = (hits[i].logo == "" ? "" : image_directory + hits[i].logo);
            }
            if(hits[i].avatar && image_directory!=null) {
                hits[i].avatar = (hits[i].avatar == "" ? "" : image_directory + hits[i].avatar);
            }
            ids.push(id);
            rsl.push(hits[i]);

        }
        var obj = {
            ids:ids,
            result:rsl,
        }
        return obj;
    },


    parseResponse: function (response) {
        var hits=response.hits.hits;
        console.log(response.hits);
        var len = hits.length;
        var rsl=[];
        for (var i=0; i<len; i++) {
            delete hits[i]["_index"];
            delete hits[i]._type;

            score=hits[i]._score;
            source=hits[i]._source;
            sort = hits[i].sort;

            id=hits[i]._id;
            hits[i]=source;
            hits[i].id=id;
            hits[i]._score=score;
            rsl.push(hits[i])

        }
        return rsl;
    },
    getPageNumber: function(req, size) {
       page_num=(req.params.page_number) ? (parseInt(req.params.page_number)-1) * size : 0;
        if(page_num<0) page_num=0;
        return page_num;
    },
    findById: function(id, index, type, callbackSuccess, callbackError) {

            elastic.get({
                index: index,
                type: (type==null?DOCUMENT_MAIN:type),
                id: id
            }).then(
                function(resp) {
                   callbackSuccess(resp);
                },
                function (err) {
                   callbackError(err);
                }
            );
    },
    getCurrentDateTime: function() {

        var now     = new Date();
        var year    = now.getFullYear();
        var month   = now.getMonth()+1;
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds();
        if(month.toString().length == 1) {
            var month = '0'+month;
        }
        if(day.toString().length == 1) {
            var day = '0'+day;
        }
        if(hour.toString().length == 1) {
            var hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
            var minute = '0'+minute;
        }
        if(second.toString().length == 1) {
            var second = '0'+second;
        }
        var dateTime = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
        return dateTime;

    }

};
