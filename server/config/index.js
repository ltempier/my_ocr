'use strict';

const _ = require('lodash'),
    path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var root = path.normalize(__dirname + '/../..');

var all = {
    root: root,
    data: path.join(root, 'data'),
    elasticsearch: {},
    rabbitmq: {},
    secret: 'MY ocr secret 123',
    TESSDATA_PREFIX: root,
    TIKA_APP_JAR: path.join(root, 'tika-app-1.14.jar'),
    ip: "127.0.0.1",
    port: process.env.PORT || 3000
};

module.exports = _.extend(all, require('./env/' + process.env.NODE_ENV + '.js') || {});
