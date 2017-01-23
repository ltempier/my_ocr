"use strict";

var async = require('async'),
    config = require('./config'),
    amqp = require('amqp'),
    File = require('./components/File'),
    database = require('./components/database');

(function () {
    File.initFileDir(true);

    var connection = amqp.createConnection(config.rabbitmq);

    connection.on('error', function (e) {
        console.log("Error from amqp: ", e);
    });

    connection.on('ready', function () {

        connection.queue('process-file', function (q) {

            q.bind('#');

            q.subscribe(function (fileOption) {

                var file = new File(fileOption);

                console.log('Start process', file.fileName);

                async.auto({
                    fetch: function (cb) {
                        if (file.exists())
                            cb();
                        else if (file.contents) {
                            file.originalFilePath = File.getTmpPath(file.getHash(), file.extension);
                            file.write(file.originalFilePath, cb);
                        }
                        else
                            cb(new Error('can\'t fetch file'))
                    },
                    document: ['fetch', function (results, cb) {
                        if (file.document)
                            cb(null, file.document);
                        else
                            database.indexFile(file, function (err, document) {
                                if (err)
                                    cb(err);
                                else {
                                    file.document = document;
                                    cb(null, document)
                                }
                            });
                    }],
                    text: ['fetch', function (results, cb) {
                        file.text(function (err, text) {
                            var result = {
                                process: true,
                                error: null,
                                text: null
                            };
                            if (err) {
                                console.log(err);
                                result.error = err;
                            }
                            else if (text)
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
                    console.log('End process', file.fileName);
                });
            });
        });
    });
})();
