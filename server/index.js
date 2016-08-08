'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    multipart = require('connect-multiparty'),
    config = require('./config'),
    path = require('path'),
    async = require('async'),
    elasticsearch = require('elasticsearch'),
    app = express(),
    api = express.Router();

var File = require('./components/File'),
    TesseractProcess = require('./components/TesseractProcess'),
    TikaProcess = require('./components/TikaProcess'),
    TextProcess = require('./components/TextProcess'),
    security = require('./components/security'),
    client = new elasticsearch.Client(config.elasticsearch);

File.initFileDir();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(multipart({
    uploadDir: path.join(config.root, config.tmpDir)
}));

app.use(express.static(path.join(config.root, 'client')));

try {
    var users = require('./access.json');
    if (!users || users.length == 0)
        throw new Error('access.json exist but is not configure');
    else {
        app.post('/auth', function (req, res) {
            var access = users.find(function (a) {
                return a.login == req.body.login && a.pwd == req.body.pwd
            });
            if (access) {
                var token = security.createToken(access);
                res.set('x-access-token', token);
                return res.status(200).send({
                    success: true,
                    token: token
                });
            } else
                return res.status(401).send({
                    success: false,
                    message: 'The user name or password is incorrect'
                });
        });
        api.use(security.middleware);
    }
}
catch (e) {
    console.log("Warning no auth (" + e.message + ")")
}

api.route('/files')
    .post(function (req, res) {
        if (req.files && req.files.file) {
            var files = req.files.file;
            if (!req.files.file.length)
                files = [files];

            res.sendStatus(200);

            async.forEach(files, function (f, next) {
                var file = new File(f.path, {
                    fileName: f.originalFilename
                });

                file.check(function (err) {
                    if (err)
                        return next();

                    var ocr = null;
                    if (file.tikaSupport())
                        ocr = new TikaProcess(file);
                    else if (file.tesseractSupport())
                        ocr = new TesseractProcess(file);
                    else if (file.textSupport())
                        ocr = new TextProcess(file);
                    else
                        return next();
                    ocr.process(function (err, body) {
                        if (err)
                            console.error(err);
                        file.save();
                        body.tags = (req.body.tags || "").split(' ');
                        body.user = {
                            id: req.user.id,
                            login: req.user.login
                        };
                        client.index({
                            index: 'files',
                            type: 'file',
                            body: body
                        }, function (err) {
                            if (err)
                                console.error(err);
                            next(); //bypass error
                        });
                    })
                })
            }, function () {

            })
        }
        else
            res.status(403).json(new Error('no files'))
    });

api.route('/text')
    .post(function (req, res) {
        if (req.files && req.files.file) {
            var files = req.files.file,
                results = [];

            if (!req.files.file.length)
                files = [files];

            async.forEach(files, function (f, next) {
                var file = new File(f.path), result = {
                    fileName: f.originalFilename
                };
                file.check(true, function (err) {
                    if (err)
                        return next();

                    var ocr = null;
                    if (file.tikaSupport())
                        ocr = new TikaProcess(file);
                    else if (file.tesseractSupport())
                        ocr = new TesseractProcess(file);
                    else if (file.textSupport())
                        ocr = new TextProcess(file);
                    else
                        return next();

                    ocr.process(function (err, body) {
                        if (err)
                            console.error(err);
                        result.text = body.text;
                        results.push(result);
                        file.clear();
                        next()
                    })
                })
            }, function () {
                if (results.length == 1)
                    results = results[0];
                res.status(200).json(results)
            })
        }
        else
            res.status(403).json(new Error('no files'))
    });

api.route('/files/:hash')
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


api.route('/search')
    .get(function (req, res) {
        var query = {
            "match_all": {}
        }, q = (req.query['q'] || "").split(' ').filter(function (value) {
            return value.length
        });
        if (q.length)
            query = {
                "bool": {
                    "must": q.map(function (value, index) {
                        return {"fuzzy": {"text": {"value": value, "max_expansions": 10 + index * 2}}}
                    })
                }
            };
        client.search({
            index: 'files',
            body: {
                "query": query,
                "from": 0,
                "size": 50
            }
        }).then(function (resp) {
            res.status(200).json(resp.hits.hits.map(function (h) {
                return h._source
            }))
        }, function (err) {
            res.status(500).json(err.message);
        });
    }
);


app.use('/api', api);


var server = require('http').createServer(app);
server.listen(3000, "0.0.0.0", function () {
    console.log('Express server listening')
});
