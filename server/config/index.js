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
    secret: 'MY ocr secret 123',
    TESSDATA_PREFIX: root,
    TIKA_APP_JAR: path.join(root, 'tika-app-1.13.jar')
};

module.exports = _.extend(all, require('./env/' + process.env.NODE_ENV + '.js') || {});
