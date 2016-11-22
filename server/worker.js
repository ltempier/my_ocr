"use strict";

var async = require('async'),
    config = require('./config');

var amqp = require('amqplib/callback_api');


amqp.connect(config.rabbitmq.uri, function (err, conn) {
    console.log(arguments)
});

