'use strict';

var path = require('path'),
    mime = require('mime'),
    fs = require('fs'),
    config = require('../config'),
    _ = require('lodash'),
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

    download(res) {
        res.setHeader('Content-type', this.mime);
        res.setHeader('Content-disposition', 'attachment; filename=' + this.fileName);
        var filestream = fs.createReadStream(this.originalFilePath);
        filestream.pipe(res);
    }

    save(cb) {
        if (cb && typeof cb === "function")
            fs.rename(this.originalFilePath, this.destFilePath, (rnErr) => {
                fs.unlink(this.tmpFilePath, function (ulErr) {
                    if (rnErr || ulErr)
                        cb([rnErr, ulErr]);
                    else
                        cb()
                })
            });
        else {
            try {
                fs.renameSync(this.originalFilePath, this.destFilePath);
                fs.unlinkSync(this.tmpFilePath)
            }
            catch (e) {
                console.error(e)
            }
        }
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

    static getTmpPath(fileName) {
        return path.join(config.root, config.tmpDir, fileName) + '.jpg';
    }

    static getFilePath(fileName) {
        return path.join(config.root, config.filesDir, fileName);
    }

    static getUrl(hash) {
        return '/api/files/' + hash;
    }
}


module.exports = File;
