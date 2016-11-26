"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || 'docker';

var async = require('async'),
    config = require('./config'),
    amqp = require('amqp'),
    File = require('./components/File'),
    database = require('./components/database');

(function () {
    var connection = amqp.createConnection(config.rabbitmq);

    connection.on('error', function (e) {
        console.log("Error from amqp: ", e);
    });

    connection.on('ready', function () {

        console.log('Start OCR worker');

        connection.queue('process-file', function (q) {

            q.bind('#');

            q.subscribe(function (fileOption) {

                var file = new File(fileOption);

                console.log('Start process', file);

                async.auto({
                    fetch: function (cb) {
                        if (file.exists())
                            cb()
                        else {
                            // TODO fetch API
                        }
                    },
                    document: ['fetch', function (results, cb) {
                        if (file.document) {
                            cb(null, file.document)
                        } else {
                            database.indexFile(file, function (err, document) {
                                if (err)
                                    cb(err);
                                else {
                                    file.document = document;
                                    cb(null, document)
                                }
                            });
                        }
                    }],
                    text: ['fetch', function (results, cb) {
                        file.text(function (err, text) {
                            var result = {
                                process: true,
                                error: null,
                                text: null
                            };
                            if (err)
                                result.error = err;
                            else
                                result.text = text;
                            cb(null, result)
                        });
                    }],
                    clear: ['text', function (results, cb) {
                        file.clear(cb)
                    }],
                    update: ['text', 'document', function (results, cb) {
                        database.update(results.document, results.text, cb)
                    }]
                }, function (err) {
                    if (err)
                        console.error(err);

                    console.log('End process', file);
                });
            });
        });
    });
})();


setTimeout(function () {
    require('./test/publish-file');
}, 500);