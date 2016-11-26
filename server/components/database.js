"use strict";

var elasticsearch = require('elasticsearch'),
    async = require('async'),
    _ = require('lodash'),
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

    indexFile(file, body, callback) {
        body.file = file.getInfo();
        this.index(body, callback);
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

    searchById(id, callback) {
        this.client.get({
            index: 'files',
            type: 'file',
            id: id
        }, function (err, resp) {
            if (err)
                callback(err);
            else
                callback(null, Elasticsearch.formatSearchResults(resp || {}))
        });
    }

    deleteById(id, callback) {
        this.client.delete({
            index: 'files',
            type: 'file',
            id: id
        }, callback);
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
                callback(null, Elasticsearch.formatSearchResults(resp.hits.hits || []))
        });
    }

    //deleteByHash(hash, callback) {
    //    this.searchByHash(hash, (err, hits) => {
    //        if (err)
    //            callback(err);
    //        else {
    //            async.each(hits, (hit, next) => {
    //                this.client.delete({
    //                    index: hit._index,
    //                    type: hit._type,
    //                    id: hit._id
    //                }, next);
    //            }, callback);
    //        }
    //    })
    //}

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
        }, function (err, res) {
            if (err)
                callback(err);
            else
                callback(null, Elasticsearch.formatSearchResults(res.hits.hits || []))
        });
    }

    static formatSearchResults(results) {
        if (!_.isArray(results))
            results = [results];
        return results.map(function (result) {
            return _.extend(result._source, {id: result._id})
        })
    }
}

var singleton = new Elasticsearch();

module.exports = singleton;
