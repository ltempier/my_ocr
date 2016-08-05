'use strict';

const _ = require('lodash'),
    path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var root = path.normalize(__dirname + '/../..');

var all = {
    root: root,
    filesDir: 'files',
    tmpDir: 'tmp',
    elasticsearch: {},
    secret:'MY ocr secret 123'
};

module.exports = _.extend(all, require('./env/' + process.env.NODE_ENV + '.js') || {});
