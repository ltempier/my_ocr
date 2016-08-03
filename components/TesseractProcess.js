'use strict';

var exec = require('child_process').exec,
    Jimp = require("jimp"),
    path = require('path'),
    mime = require('mime'),
    fs = require('fs'),
    config = require('../config'),
    crypto = require('crypto');

process.env.TESSDATA_PREFIX = config.root;

class TesseractProcess {

    constructor(filePath) {

        this.language = "fra+eng";

        this.originalFilePath = filePath;

        this.fileName = path.basename(filePath);
        this.mime = mime.lookup(filePath);

        this.tmpFilePath = path.join(config.tmp, this.getHash()) + '.jpg';
        this.destFilePath = path.join(config.files, this.getHash());
    }

    process(cb) {
        this.check((err) => {
            if (err)
                cb(err);
            else {
                var filePath = this.tmpFilePath;
                this.performTo(filePath, (err) => {
                    if (err)
                        this.parse(this.originalFilePath, cb);
                    else
                        this.parse(filePath, (err) => {
                            if (err)
                                cb(err);
                            else {
                                cb(null, {
                                    fileName: this.fileName,
                                    mime: this.mime,
                                    hash: this.getHash(),
                                    text: this.text
                                })
                            }
                        })
                })
            }
        })
    }

    save(cb) {
        fs.rename(this.originalFilePath, this.destFilePath, (rnErr) => {
            fs.unlink(this.tmpFilePath, function (ulErr) {
                if (rnErr || ulErr)
                    cb([rnErr, ulErr]);
                else
                    cb()
            })
        })
    }

    parse(filePath, cb) {
        var command = ['tesseract', filePath, 'stdout', '-l', this.language].join(' ');
        exec(command, (error, stdout, stderr) => {
            if (error)
                cb(error);
            else {
                var text = (stdout || "").split('\n').filter(function (line) {
                    line = line.replace(/\s\s+/g, ' ');
                    line = line.replace(/[^A-Za-z0-9]/g, '');
                    return line.length > 0
                }).map(function (line) {

                    line = line.replace(/\s\s+/g, ' ');
                    line = line.replace(/\.\.+/g, '.');

                    return line
                }).join('\n');

                this.text = text;
                this.err = stderr;

                cb(null, stdout, stderr)
            }
        })
    }

    performTo(tmpFilePath, cb) {
        Jimp.read(this.originalFilePath, (err, image) => {
            if (err)
                return cb(err);

            var command = ['tesseract', this.originalFilePath, 'stdout', '-l', this.language, '-psm 0'].join(' ');
            exec(command, function (error, stdout) {
                if (error)
                    cb(error);
                else {
                    try {
                        stdout.split('\n').forEach(function (line) {
                            var res = line.split(':');
                            if (res[0] == 'Rotate')
                                image.rotate(parseInt(res[1]))
                        });
                    }
                    finally {
                        image
                            .quality(60)
                            .greyscale()
                            .contrast(0.5);

                        image.write(tmpFilePath, cb);
                    }
                }
            })
        })
    }

    check(cb) {
        fs.exists(this.originalFilePath, (exists) => {
            if (!exists)
                cb(new Error('Original file not exist'));
            else
                fs.exists(this.destFilePath, function (exists) {
                    if (exists)
                        cb(new Error('File already process'));
                    else
                        cb()
                })
        })
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
}

module.exports = TesseractProcess;