'use strict';

var fs = require('fs-extra'),
    async = require('async'),
    TesseractProcess = require('./server/components/TesseractProcess'),
    TikaProcess = require('./server/components/TikaProcess'),
    File = require('./server/components/File'),
    elasticsearch = require('elasticsearch');


var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

var testDir = __dirname + '/test',
    exDir = __dirname + '/example';


try {
    fs.mkdirSync(testDir);
}
catch (e) {
}
finally {
    var fileName = '2.jpg';
    fs.copySync(exDir + "/" + fileName, testDir + "/" + fileName);
    var file = new File(testDir + "/" + fileName);

    var ocr = null;
    if (file.tikaSupport())
        ocr = new TikaProcess(file);
    else if (file.tesseractSupport())
        ocr = new TesseractProcess(file);
    else if (file.textSupport())
        ocr = new TextProcess(file);

    ocr.log = true

    if (ocr)
        ocr.process(function (err, res) {
            console.log('res:', res.text);
            exit(err)
        });

    setInterval(function () {
        console.log('yo')
    }, 1000)

}


//try {
//    fs.mkdirSync(testDir);
//}
//catch(e){}
//finally {
//    var fileName = 'bp_aout.JPG';
//    fs.copySync(exDir + "/" + fileName, testDir + "/" + fileName);
//    var f = new File(testDir + "/" + fileName);
//
//    var p = new TesseractProcess(f, {
//        force: true
//    });
//
//    p.process(function (err, res) {
//        if (err)
//            exit(err);
//        else {
//            console.log('res:', res);
//            client.index({
//                index: 'files',
//                type: 'file',
//                body: res
//            }, exit);
//        }
//    });
//}


//try {
//    fs.mkdirSync(testDir);
//}
//catch(e){}
// finally {
//    var files = fs.readdirSync(exDir);
//    async.eachLimit(files, 5, function (fileName, next) {
//        fs.copySync(exDir + "/" + fileName, testDir + "/" + fileName);
//        var f = new File(testDir + "/" + fileName);
//        var p = new TesseractProcess(f, {
//            force: true
//        });
//        p.process(function (err, res) {
//            if (err) {
//                console.error(err);
//                next()
//            }
//            else {
//                console.log('');
//                console.log('file ', fileName);
//                console.log('res:', res);
//                f.save(function (err) {
//                    if (err)
//                        console.error(err);
//
//                    client.index({
//                        index: 'files',
//                        type: 'file',
//                        body: res
//                    }, function (err) {
//                        if (err)
//                            console.error(err);
//                        next()
//                    });
//                })
//
//
//            }
//        });
//    }, exit)
//}

function exit(err) {
    if (err)
        console.error(err);
    if (client)
        client.close();
    try {
        fs.removeSync(testDir)
    } finally {
        process.exit(err ? 1 : 0)
    }
}
