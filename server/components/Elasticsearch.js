"use strict";

var elasticsearch = require('elasticsearch'),
    async = require('async'),
    config = require('../config');

class Elasticsearch {
    constructor() {
        this.client = null;
        this.init()
    }

    init() {
        this.client = new elasticsearch.Client(config.elasticsearch);
        this.client.indices.create({
            index: 'files'
        })
    }

    update(document, body, callback) {
        body.dateLastUpdate = Date.now();
        this.client.update({
            index: document._index,
            type: document._type,
            id: document._id,
            body: {
                doc: body,
                doc_as_upsert: true
            }
        }, callback);
    }

    indexFile(file, callback) {
        this.index({
            file: file.getInfo()
        }, callback);
    }

    index(body, callback) {
        body.dateCreation = Date.now();
        body.dateLastUpdate = Date.now();
        this.client.index({
            index: 'files',
            type: 'file',
            body: body
        }, callback);
    }

    deleteByHash(hash, callback) {
        this.searchByHash(hash, (err, hits) => {
            if (err)
                callback(err);
            else {
                async.each(hits, (hit, next) => {
                    this.client.delete({
                        index: hit._index,
                        type: hit._type,
                        id: hit._id
                    }, next);
                }, callback);
            }
        })
    }

    searchByHash(hash, callback) {
        this.client.search({
            index: 'files',
            body: {
                "query": {
                    "match": {
                        "file.hash": hash
                    }
                },
                "from": 0
            }
        }, function (err, resp) {
            if (err)
                callback(err);
            else
                callback(null, resp.hits.hits || [])
        });

    }

    searchByQuery(query, callback) {
        this.client.search({
            index: 'files',
            body: {
                "query": query,
                "sort": [
                    {"dateLastUpdate": "desc"}
                ],
                "from": 0,
                "size": 50
            }
        }, function (err, resp) {
            if (err)
                callback(err);
            else
                callback(null, resp.hits.hits || [])
        });
    }
}

var singleton = new Elasticsearch();

module.exports = singleton;
