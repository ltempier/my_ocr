'use strict';

var path = require('path'),
    mime = require('mime'),
    fs = require('fs-extra'),
    config = require('../config'),
    _ = require('lodash'),
    async = require('async'),
    crypto = require('crypto');

class File {
    constructor(filePath, options) {
        if (!this.exists(filePath))
            throw new Error("File not exist " + filePath);

        this.originalFilePath = filePath;
        this.fileName = path.basename(filePath);
        this.mime = mime.lookup(filePath);

        _.each(options, (value, key) => {
            if (!_.isUndefined(value) && !_.isNull(value))
                this[key] = value
        });

        this.tmpFilePath = File.getTmpPath(this.getHash());
        this.destFilePath = File.getFilePath(this.getHash());
        this.url = File.getUrl(this.getHash())
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

    download(res) {
        res.setHeader('Content-type', this.mime);
        res.setHeader('Content-disposition', 'attachment; filename=' + this.fileName);
        var filestream = fs.createReadStream(this.originalFilePath);
        filestream.pipe(res);
    }

    clear(cb) {
        async.each([this.originalFilePath, this.tmpFilePath], function (path, next) {
            fs.exists(path, function (exists) {
                if (exists)
                    fs.unlink(path, next);
                else
                    next()
            })
        }, cb)
    }

    save(cb) {
        fs.copy(this.originalFilePath, this.destFilePath, cb)
    }

    remove(cb) {
        async.each([this.originalFilePath, this.tmpFilePath, this.destFilePath], function (path, next) {
            fs.exists(path, function (exists) {
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

    static initFileDir() {
        ['tmp', 'files', 'upload'].forEach(function (dirName) {
            var dirPath = path.join(config.data, dirName);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirsSync(dirPath);
            }
        })
    }

    static getTmpPath(fileName) {
        return path.join(config.data, 'tmp', fileName) + '.jpg';
    }

    static getFilePath(fileName) {
        return path.join(config.data, 'files', fileName);
    }

    static getUrl(hash) {
        return '/api/files/' + hash;
    }
}


module.exports = File;
