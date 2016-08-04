'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    multipart = require('connect-multiparty'),
    config = require('./config'),
    path = require('path'),
    elasticsearch = require('elasticsearch'),
    app = express();

var File = require('./components/File'),
    TesseractProcess = require('./components/TesseractProcess'),
    client = new elasticsearch.Client(config.elasticsearch);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(multipart({
    uploadDir: path.join(config.root, config.tmpDir)
}));
app.use(express.static(path.join(config.root, 'client')));

app.route('/files')
    .post(function (req, res) {
        if (req.files && req.files.file) {
            var file = new File(req.files.file.path, {
                fileName: req.files.file.originalFilename
            });
            var tesseract = new TesseractProcess(file);

            tesseract.process(function (err) {
                if (err)
                    res.status(500).json(err.message);
                else {
                    file.save(function () {
                        res.sendStatus(200)
                    })
                }
            })
        }
        else
            res.status(500).json(new Error('no files'))
    });

app.route('/files/:hash')
    .get(function (req, res) {
        client.search({
            index: 'files',
            body: {
                "query": {
                    "match": {
                        "file.hash": req.params.hash
                    }
                },
                "from": 0,
                "size": 1
            }
        }).then(function (resp) {
            if (resp.hits.hits.length) {
                try {
                    var option = resp.hits.hits[0]._source.file,
                        file = new File(File.getFilePath(option.hash), option);
                    file.download(res);
                } catch (err) {
                    res.status(500).json(err.message);
                }
            } else
                res.sendStatus(404)
        }, function (err) {
            res.status(500).json(err.message);
        });
    });

app.route('/search')
    .get(function (req, res) {
        client.search({
            index: 'files',
            body: {
                "query": {
                    "bool": {
                        "must": req.query['q'].split(' ').filter(function (value) {
                            return value.length
                        }).map(function (value, index) {
                            return {"fuzzy": {"text": {"value": value, "max_expansions": 10 + index * 2}}}
                        })
                    }
                },
                "from": 0,
                "size": 10
            }
        }).then(function (resp) {
            res.status(200).json(resp.hits.hits.map(function (h) {
                return h._source
            }))
        }, function (err) {
            res.status(500).json(err.message);
            console.trace(err.message);
        });
    });

var server = require('http').createServer(app);
server.listen(3000, "0.0.0.0", function () {
    console.log('Express server listening')
});
