'use strict';

var config = require('../config'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken');

class Security {
    constructor() {

    }

    createToken(user) {
        return jwt.sign(user, config.secret, {expiresIn: "24h"});
    }

    middleware(req, res, next) {
        var token = (req.body.token || req.query.token || req.headers['x-access-token']).toString();
        if (req.url == "/auth")
            next();
        else if (token) {
            jwt.verify(token, config.secret, function (err, user) {
                if (err)
                    return res.status(401).json({success: false, message: 'Failed to authenticate token.'});
                else {
                    req.user = user;
                    next();
                }
            });
        }
        else
            return res.status(403).send({
                success: false,
                message: 'No token provided. Go to /auth'
            });
    }
}


var singleton = new Security();


module.exports = singleton;



