'use strict';
const path = require('path');
module.exports = {
    env: 'development',
    elasticsearch: {
        host: '127.0.0.1:9200',
        //log: 'trace'
    },
    rabbitmq: {
        host: '127.0.0.1',
        port: 5672,
        login: 'ocr',
        password: 'secret_pass'
    },
    data: path.normalize(__dirname + '/../../data-worker')
};
