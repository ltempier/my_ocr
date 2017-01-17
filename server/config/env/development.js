'use strict';

module.exports = {
    env: 'development',
    elasticsearch: {
        host: '127.0.0.1:9200',
        log: 'trace'
    },
    rabbitmq: {
        host: '127.0.0.1',
        port: 5672,
        login: 'ocr',
        password: 'secret_pass'
    },
    ip: "0.0.0.0"
};
