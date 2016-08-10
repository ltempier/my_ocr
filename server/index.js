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
    uploadDir: path.join(config.data, 'upload')
}));

app.use(express.static(path.join(config.root, 'client')));

try {
    var users = require('./access.json');
    if (!users || users.length == 0)
        throw new Error('access.json exist but is not configure');
    else {
        security.setUsers(users);

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
        api.use(security.middleware.bind(security));
    }
}
catch (e) {
    console.log("Warning no auth (" + e.message + ")")
}

api.route('/files')
    .post(function (req, res) {
        if (req.files && req.files.file) {
            var files = req.files.file;

            if (!files.length)
                files = [files];

            files = files.map(function (f) {
                return new File(f.path, {
                    fileName: f.originalFilename
                })
            });

            async.auto({
                save: function (callback) {
                    async.eachOf(files, function (file, index, next) {
                        file.check(function (err) { //TODO check in elasticsearch too
                            if (err) {
                                files.splice(index, 1);
                                file.clear(next);
                            }
                            else
                                file.save(next)
                        })
                    }, callback)
                },
                documents: ['save', function (results, callback) {
                    async.each(files, function (file, next) {
                        client.index({
                            index: 'files',
                            type: 'file',
                            body: {
                                file: file.getInfo()
                            }
                        }, function (err, document) {
                            file.document = document;
                            next(err)
                        });
                    }, callback)
                }],
                res: ['save', 'documents', function (results, cb) {
                    res.sendStatus(200);
                    cb()
                }],
                process: ['documents', function (results, callback) {
                    async.eachLimit(files, 3, function (file, next) {
                        var ocr = null,
                            document = file.document,
                            body = {
                                process: false
                            };
                        async.series([
                            function (cb) {
                                if (file.tikaSupport())
                                    ocr = new TikaProcess(file);
                                else if (file.tesseractSupport())
                                    ocr = new TesseractProcess(file);
                                else if (file.textSupport())
                                    ocr = new TextProcess(file);
                                cb()
                            },
                            function (cb) {
                                if (ocr)
                                    ocr.process(function (err, result) {
                                        if (!err)
                                            body = result;
                                        cb()
                                    });
                                else
                                    cb()
                            },
                            function (cb) {
                                body.tags = (req.body.tags || "").split(' ');
                                body.user = {
                                    id: req.user.id,
                                    login: req.user.login
                                };

                                if (document && document._id) {
                                    client.update({
                                        index: document._index,
                                        type: document._type,
                                        id: document._id,
                                        body: {
                                            doc: body,
                                            doc_as_upsert: true
                                        }
                                    }, cb);
                                } else {
                                    client.index({
                                        index: 'files',
                                        type: 'file',
                                        body: body
                                    }, cb);
                                }
                            },
                            function (cb) {
                                file.clear(cb)
                            }
                        ], function (err) {
                            if (err)
                                console.log(err);
                            next(); //bypass process error
                        })
                    }, callback)
                }]
            }, function (err) {
                if (err)
                    console.log(err)
            });
        }
        else
            res.status(403).json(new Error('no files'))
    });

api.route('/text')
    .post(function (req, res) {
        if (req.files && req.files.file) {
            var f = req.files.file,
                result = {};

            if (f.length) {
                f = f[0];
                result.warning = "only one file is processed"
            }

            result.fileName = f.originalFilename;
            var file = new File(f.path);

            file.check(true, function (err) {
                if (err)
                    return res.status(403).json(err);

                var ocr = null;
                if (file.tikaSupport())
                    ocr = new TikaProcess(file);
                else if (file.tesseractSupport())
                    ocr = new TesseractProcess(file, {
                        language: req.body.language
                    });
                else if (file.textSupport())
                    ocr = new TextProcess(file);
                else
                    return res.status(403).json(new Error("File format not support"));

                ocr.process(function (err, body) {
                    if (err)
                        console.error(err);
                    result.text = body.text;
                    file.clear(function (err) {
                        if (err)
                            console.log(err);
                        res.status(200).json(result)
                    });
                })
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
    })
    .delete(function (req, res) {
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
                async.each(resp.hits.hits, function (hit, next) {
                    client.delete({
                        index: 'myindex',
                        type: 'mytype',
                        id: '1'
                    }, function (error, response) {
                        file.remove(function (err) {


                        })
                    });
                }, function () {
                    res.sendStatus(200)
                });
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
server.listen(config.port, config.ip, function () {
    console.log('Express server listening')
});
