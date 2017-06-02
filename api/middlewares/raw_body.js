/**
 * Created by Emmanuel on 4/29/2016.
 */

var getRawBody = require('raw-body');
var typer = require('media-typer');

module.exports = function (req, res, next) {
    console.log(req.headers);
    getRawBody(req, {
        length: req.headers['content-length'],
        limit: '1mb',
        encoding: typer.parse(req.headers['content-type']).parameters.charset
    }, function (err, string) {
        if (err) return next(err);
        req.rawBody = string;
        next();
    });
};
