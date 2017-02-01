'use strict';

var path = require('path'),
    root = path.normalize(__dirname + '/../../..');

module.exports = {
    env: 'worker',
    elasticsearch: {
        host: '127.0.0.1:9200'
    },
    rabbitmq: {
        host: '127.0.0.1',
        port: 5672,
        login: 'ocr',
        password: 'secret_pass'
    },
    data: path.join(root, 'data-worker')
};
