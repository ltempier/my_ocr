'use strict';

var config = require('../config'),
    crypto = require('crypto'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken');

class Security {
    constructor() {
        this.users = [];
        this.keys = ['id', 'login', 'pwd']

    }

    setUsers(users) {
        this.users = users
    }

    createToken(user) {
        return jwt.sign(user, config.secret);
    }

    exists(user, keys) {
        keys = keys || this.keys;
        return this.users.find(function (knowUser) {
            var exist = true;
            keys.forEach(function (key) {
                if (knowUser[key].toLowerCase() != user[key].toLowerCase())
                    exist = false
            });
            return exist
        });
    }

    middleware(req, res, next) {
        var token = (req.body.token || req.query.token || req.headers['x-access-token']).toString();
        if (req.url == "/auth")
            next();
        else if (token) {
            jwt.verify(token, config.secret, (err, user) => {
                if (err)
                    return res.status(401).json({success: false, message: 'Failed to authenticate token.'});
                else {
                    if (this.exists(user)) {
                        req.user = user;
                        next();
                    } else
                        res.status(401).json({success: false, message: 'Failed to authenticate token.'});
                }
            });
        }
        else
            return res.status(401).send({
                success: false,
                message: 'No token provided. Go to /auth'
            });
    }
}


var singleton = new Security();


module.exports = singleton;



