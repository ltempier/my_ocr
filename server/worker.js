"use strict";

var config = require('./config'),
    amqp = require('amqp'),
    File = require('./components/File');

var connection = amqp.createConnection(config.rabbitmq);

connection.on('error', function (e) {
    console.log("Error from amqp: ", e);
});

// Wait for connection to become established.
connection.on('ready', function () {
    // Use the default 'amq.topic' exchange
    connection.queue('process-file', function (q) {
        // Catch all messages
        q.bind('#');

        // Receive messages
        q.subscribe(function (message) {
            // Print messages to stdout

            /*
             get file by request
             process
             save id db
             */

            console.log(message);
        });
    });


});