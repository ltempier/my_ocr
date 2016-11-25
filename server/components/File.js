'use strict';

var path = require('path'),
    mime = require('mime'),
    fs = require('fs-extra'),
    config = require('../config'),
    _ = require('lodash'),
    async = require('async'),
    crypto = require('crypto'),
    TesseractProcess = require('./TesseractProcess'),
    TikaProcess = require('./TikaProcess'),
    TextProcess = require('./TextProcess'),
    amqp = require('amqp');

class File {
    constructor(filePath, options) {
        if (!this.exists(filePath))
            throw new Error("File not exist " + filePath);

        this.originalFilePath = filePath;
        this.fileName = path.basename(filePath);
        this.mime = mime.lookup(filePath);
        this.extension = path.extname(this.fileName);

        _.each(options, (value, key) => {
            if (!_.isUndefined(value) && !_.isNull(value))
                this[key] = value
        });

        this.tmpFilePath = File.getTmpPath(this.getHash(), this.extension);
        this.destFilePath = File.getFilePath(this.getHash());
        this.url = File.getUrl(this.getHash())
    }

    publish() {
        this.save((err)=> {
            if (err)
                throw err;
            var connection = amqp.createConnection(config.rabbitmq);
            connection.on('error', function (e) {
                console.log("Error from amqp: ", e);
            });
            connection.on('ready', () => {
                connection.publish('process-file', this, {}, function () {
                    console.log(arguments);
                    connection.disconnect()
                });
            });
        })
    }

    check(force, cb) {
        if (typeof force === "function")
            cb = force;

        this.exists((exists) => {
            if (!exists)
                cb(new Error('Original file not exist'));
            else if (force == true)
                cb();
            else
                this.exists(this.destFilePath, function (exists) {
                    if (exists)
                        cb(new Error('File already process'));
                    else
                        cb()
                })
        })
    }

    tesseractSupport() {
        return (/^image\//i).test(this.mime)
    }

    tikaSupport() {
        return (/^application\//i).test(this.mime)
    }

    textSupport() {
        return (/^text\//i).test(this.mime)
    }

    text(callback) {
        var ocr = null;
        if (this.tikaSupport())
            ocr = new TikaProcess(this);
        else if (this.tesseractSupport())
            ocr = new TesseractProcess(this);
        else if (this.textSupport())
            ocr = new TextProcess(this);

        if (ocr)
            ocr.process(callback);
        else
            callback()
    }

    download(res) {
        res.setHeader('Content-type', this.mime);
        res.setHeader('Content-disposition', 'attachment; filename=' + this.fileName);
        var filestream = fs.createReadStream(this.originalFilePath);
        filestream.pipe(res);
    }

    clear(cb) {
        async.eachSeries([this.originalFilePath, this.tmpFilePath], function (path, next) {
            fs.exists(path, function (exists) {
                if (exists)
                    fs.unlink(path, next);
                else
                    next()
            })
        }, cb)
    }

    save(cb) {
        if (!this.exists(this.destFilePath))
            fs.copy(this.originalFilePath, this.destFilePath, cb);
        else
            cb()
    }

    remove(cb) {
        async.eachSeries([this.originalFilePath, this.tmpFilePath, this.destFilePath], (path, next) => {
            this.exists(path, function (exists) {
                if (exists)
                    fs.unlink(path, next);
                else
                    next()
            })
        }, cb)
    }

    moveToTmp(cb) {
        fs.move(this.originalFilePath, this.tmpFilePath, cb)
    }

    exists(filePath, cb) {
        if (typeof filePath === "function") {
            cb = filePath;
            filePath = null
        }
        filePath = filePath || this.originalFilePath;
        if (cb && typeof cb === "function")
            fs.exists(filePath, cb);
        else
            return fs.existsSync(filePath)
    }

    getHash() {
        if (this.md5)
            return this.md5;

        var bufferSize = 1024 * 8,
            fd = fs.openSync(this.originalFilePath, 'r'),
            hash = crypto.createHash('md5'),
            buffer = new Buffer(bufferSize);

        try {
            var bytesRead;
            do {
                bytesRead = fs.readSync(fd, buffer, 0, bufferSize);
                hash.update(buffer.slice(0, bytesRead))
            } while (bytesRead === bufferSize)
        } finally {
            fs.closeSync(fd)
        }

        this.md5 = hash.digest('hex');
        return this.md5
    }

    getInfo() {
        return {
            fileName: this.fileName,
            mime: this.mime,
            hash: this.getHash(),
            url: this.url
        }
    }

    static initFileDir(clear) {
        ['tmp', 'files', 'upload'].forEach(function (dirName) {
            var dirPath = path.join(config.data, dirName);

            if (clear === true)
                fs.removeSync(dirPath);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirsSync(dirPath);
            }
        })
    }

    static getTmpPath(fileName, extension) {
        return path.join(config.data, 'tmp', fileName + extension || '');
    }

    static getFilePath(fileName) {
        return path.join(config.data, 'files', fileName);
    }

    static getUrl(hash) {
        return '/api/files/' + hash;
    }
}


module.exports = File;
