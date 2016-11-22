'use strict';

module.exports = {
    env: 'docker',
    elasticsearch: {
        host: '192.168.99.100:9200',
        //log: 'trace'
    },
    rabbitmq: {
        uri: 'amqp://guest:guest@192.168.99.100:5672'
    }
};
