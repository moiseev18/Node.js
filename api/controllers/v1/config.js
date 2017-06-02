/**
 * Created by Emmanuel on 4/18/2016.
 */
/**
 * Created by Emmanuel on 4/16/2016.
 */

var client = require(__base+'./config/redis')
var auth = require("../v1/auth");

module.exports = {
    all: function (req, res) {
        console.info('here');
        client.hgetall('client_config', function(err, object) {
            if(object !== null){
                res.send(object);
            }else{
                res.send({ message: 'no config file found'});
            }
        });
    },
    find: function (req, res) {
        var key = req.params.key;
        console.info('key', key);
        client.hgetall('client_config', function(err, object) {
            var value = object[key];
            if(typeof value !== 'undefined'){
                res.send(object[key]);
            }else{
                res.send(null);
            }
        });

    },
    store: function (req, res, next) {
        client.hmset('client_config' , req.body , function(err, reply){
            if(err) return next(err);
            res.send(reply);
        });
    },
    getDate: function(req, res) {
        //console.log("date", Date.now());
        res.send(""+Date.now())
    }
};
