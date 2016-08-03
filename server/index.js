'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    multipart = require('connect-multiparty'),
    config = require('../config'),
    elasticsearch = require('elasticsearch'),
    app = express();


var client = new elasticsearch.Client(config.elasticsearch);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());


app.route('/files')
    .post(function (req, res) {

    });

app.route('/files/:hash')
    .get(function (req, res) {

    });


app.route('/search')
    .get(function (req, res) {
        client.search({
            index: 'files',
            body: {
                "query": {
                    "bool": {
                        "must": req.query['q'].split(' ').map(function (value, index) {
                            return {"fuzzy": {"text": {"value": value, "max_expansions": 5 + index * 2}}}
                        })
                    }
                },
                "from": 0,
                "size": 10
            }
        }).then(function (resp) {
            res.status(200).json(resp.hits.hits)
        }, function (err) {
            res.status(500).json(err.message);
            console.trace(err.message);
        });
    });

var server = require('http').createServer(app);
server.listen(3000, "0.0.0.0", function () {
    console.log('Express server listening')
});