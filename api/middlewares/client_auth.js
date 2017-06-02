/**
 * Created by Emmanuel on 4/16/2016.
 */
var env = global.env;
var jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

    var client_key = req.body.client_key || req.query.client_key || req.headers['x-client-key'];

    // decode token
    if (client_key) {
        for (var i in env.client_keys){
            if(env.client_keys[i].key==client_key) {
               // req.decoded = decoded;
                global.client=env.client_keys[i];
                next();
                return;
            }
        }
        return res.status(403).send({
            success: false,
            message: 'Invalid client key ('+client_key+').'
        });
    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No client key provided.'
        });
    }
};
