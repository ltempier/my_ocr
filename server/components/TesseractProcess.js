'use strict';

var exec = require('child_process').exec,
    Jimp = require("jimp"),
    _ = require('lodash'),
    config = require('../config');

process.env.TESSDATA_PREFIX = config.root;

class TesseractProcess {

    constructor(file, options) {
        this.language = "fra+eng";
        this.file = file;
        this.log = false;

        _.each(options, (value, key) => {
            if (!_.isUndefined(value) && !_.isNull(value))
                this[key] = value
        });
    }

    process(cb) {
        this.check((err) => {
            if (err)
                cb(err);
            else {
                var filePath = this.file.tmpFilePath;
                this.performTo(filePath, (err) => {
                    if (err)
                        this.parse(this.originalFilePath, end.bind(this));
                    else
                        this.parse(filePath, end.bind(this))
                })
            }
        });

        function end(err, text) {
            if (err)
                cb(err, {
                    date: Date.now(),
                    file: this.file.getInfo(),
                    error: true,
                    text: ""
                });
            else
                cb(null, {
                    date: Date.now(),
                    file: this.file.getInfo(),
                    text: text
                })
        }
    }

    parse(filePath, cb) {
        if (this.log)
            console.log('start parse image ' + filePath);

        var command = ['tesseract', filePath, 'stdout', '-l', this.language, '-psm 3'].join(' ');
        exec(command, (error, stdout) => {
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
                cb(null, text)
            }
        })
    }

    performTo(tmpFilePath, cb) {
        if (this.log)
            console.log('start perform image ' + this.file.originalFilePath + ' -> ' + tmpFilePath);
        Jimp.read(this.file.originalFilePath, (err, image) => {
                if (err)
                    cb(err);
                else {
                    image
                        .autocrop()
                        .greyscale();

                    image.write(tmpFilePath, cb);
                }
            }
        )
    }

    check(cb) {
        this.file.exists((exists) => {
            if (!exists)
                cb(new Error('Original file not exist'));
            else if (this.force == true)
                cb();
            else
                this.file.exists(this.file.destFilePath, function (exists) {
                    if (exists)
                        cb(new Error('File already process'));
                    else
                        cb()
                })

        })
    }
}

module
    .
    exports = TesseractProcess;
