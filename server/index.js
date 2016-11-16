'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    multipart = require('connect-multiparty'),
    config = require('./config'),
    path = require('path'),
    async = require('async'),
    app = express(),
    morgan = require('morgan'),
    api = express.Router();

var File = require('./components/File'),
    elasticsearch = require('./components/Elasticsearch'),
    TesseractProcess = require('./components/TesseractProcess'),
    TikaProcess = require('./components/TikaProcess'),
    TextProcess = require('./components/TextProcess'),
    security = require('./components/security');

File.initFileDir();
elasticsearch.init();

app.use(morgan('short'));
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
            var user = security.exists({
                login: req.body.login || req.body.user,
                pwd: req.body.pwd || req.body.password
            });

            if (user) {
                var token = security.createToken(user);
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

            async.series([
                function (callback) {
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
                function (callback) {
                    async.each(files, function (file, next) {
                        elasticsearch.indexFile(file, function (err, document) {
                            if (!err)
                                file.document = document;
                            next()
                        });
                    }, callback)
                }
            ], function (err) {
                if (err)
                    res.status(403).json(err);
                else {
                    res.sendStatus(200);
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
                                        if (err)
                                            console.log(err)
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
                                    elasticsearch.update(document, body, cb)
                                } else
                                    elasticsearch.index(body, cb);
                            },
                            function (cb) {
                                file.clear(cb)
                            }
                        ], function (err) {
                            if (err)
                                console.log(err);
                            next();
                        })
                    }, function (err) {
                        if (err)
                            console.log(err)
                    })
                }
            })
        }
        else
            res.status(403).json(new Error('no files'))
    });

api.route('/text')
    .post(function (req, res) {
        if (req.files && req.files.file) {
            var f = req.files.file,
                result = {};

            if (f.length)
                return res.status(403).json(new Error("Can't process multiple files"));

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
        var hash = req.params.hash;
        if (hash && hash.length) {
            elasticsearch.searchByHash(hash, function (err, hits) {
                if (hits.length) {
                    try {
                        var option = hits[0]._source.file,
                            file = new File(File.getFilePath(option.hash), option);
                        file.download(res);
                    } catch (err) {
                        res.status(500).json(err.message);
                    }
                } else
                    res.sendStatus(404)
            })
        } else
            res.status(500).json(new Error('no hash'));
    })
    .delete(function (req, res) {
        var hash = req.params.hash;
        if (hash && hash.length) {
            elasticsearch.deleteByHash(hash, function (err) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    var file = new File(File.getFilePath(hash));
                    file.remove(function (err) {
                        if (err)
                            res.status(500).json(err);
                        else
                            res.sendStatus(200)
                    })
                }
            });
        } else
            res.status(500).json(new Error('no hash'));
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

            elasticsearch.searchByQuery(query, function (err, hits) {
                if (err)
                    res.status(500).json(err.message);
                else
                    res.status(200).json(hits.map(hit => hit._source))
            })

        }
    );


app.use('/api', api);


var server = require('http').createServer(app);
server.listen(config.port, config.ip, function () {
    console.log('Express server listening')
});
