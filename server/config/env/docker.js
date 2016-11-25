'use strict';

module.exports = {
    env: 'docker',
    elasticsearch: {
        host: '192.168.99.100:9200',
        //log: 'trace'
    },
    rabbitmq: {
        host: '192.168.99.100',
        port: 5672,
        login: 'guest',
        password: 'guest'
    }
};
