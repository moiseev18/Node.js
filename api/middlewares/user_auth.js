/**
 * Created by Emmanuel on 4/16/2016.
 */
var jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        console.info("Token : ", token);
        // verifies secret and checks exp
        jwt.verify(token, req.app.get('server_secret'), function(err, decoded) {
            if (err) {
                //
                return res.json({ success: false, message: 'Failed to authenticate token.', authFailed: true });
                next();//remove later
            } else {
                req.userLoggedIn = decoded;

                if(!req.params.user_id) {
                    req.params.user_id=req.userLoggedIn.id;
                }
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        //next();//remove later

        return res.status(403).json({
            success: false,
            message: 'No token provided.',
            user : {}
        });
    }
};
