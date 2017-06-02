/**
 * Created by Emmanuel on 5/29/2016.
 */

var locals = require('./locals');

var env = require('./env/production');
if(locals.environment === 'development'){
    env = require('./env/development');
}


module.exports = env;
