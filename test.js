'use strict';

var fs = require('fs'),
    async = require('async'),
    TesseractProcess = require('./components/TesseractProcess'),
    elasticsearch = require('elasticsearch');


var client = new elasticsearch.Client({
    host: 'localhost:9200',
    //log: 'trace'
});

//client.indices.create({index: 'files'}, function(err){
//    if (err)
//        console.error(err);
//});

//var p = new TesseractProcess(__dirname + '/example/4.png');
//
//p.process(function (err, res) {
//    if (err){
//        console.error(err);
//        next()
//    }
//    else {
//
//        console.log('res:', res);
//
//        client.index({
//            index: 'files',
//            type: 'file',
//            body: res
//        }, next);
//    }
//});

//
fs.readdir(__dirname + '/example/', (err, files) => {
    if (err)
        exit(err);
    async.eachLimit(files, 5,function (file, next) {

        var p = new TesseractProcess(__dirname + '/example/' + file);
        p.process(function (err, res) {
            if (err) {
                console.error(err);
                next()
            }
            else {

                console.log('');
                console.log('file ', file);
                console.log('res:', res);

                client.index({
                    index: 'files',
                    type: 'file',
                    body: res
                }, function (err) {
                    if (err)
                        console.error(err);
                    next()
                });
            }
        });
    }, exit)
});

function exit(err) {
    if (err)
        console.error(err);
    if (client)
        client.close();
    process.exit(err ? 1 : 0)
}
