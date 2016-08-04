'use strict';

var fs = require('fs'),
    async = require('async'),
    TesseractProcess = require('./server/components/TesseractProcess'),
    File = require('./server/components/File'),
    elasticsearch = require('elasticsearch');


var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

//var f = new File(__dirname + '/example/1.png');
//var p = new TesseractProcess(f);
//p.process(function (err, res) {
//    if (err)
//        exit(err);
//    else {
//        console.log('res:', res);
//        client.index({
//            index: 'files',
//            type: 'file',
//            body: res
//        }, exit);
//    }
//});

fs.readdir(__dirname + '/example/', (err, files) => {
    if (err)
        exit(err);
    async.eachLimit(files, 5, function (file, next) {
        var f = new File(__dirname + '/example/' + file);
        var p = new TesseractProcess(f, {
            force: true
        });
        p.process(function (err, res) {
            if (err) {
                console.error(err);
                next()
            }
            else {
                console.log('');
                console.log('file ', file);
                console.log('res:', res);
                f.save(function (err) {
                    if (err)
                        console.error(err);

                    client.index({
                        index: 'files',
                        type: 'file',
                        body: res
                    }, function (err) {
                        if (err)
                            console.error(err);
                        next()
                    });
                })


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
