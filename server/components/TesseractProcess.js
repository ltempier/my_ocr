'use strict';

var exec = require('child_process').exec,
    Jimp = require("jimp"),
    _ = require('lodash'),
    config = require('../config');

process.env.TESSDATA_PREFIX = config.TESSDATA_PREFIX;

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
        var filePath = this.file.tmpFilePath;
        this.performImage(filePath, (err) => {
            if (err)
                this.text(this.file.originalFilePath, end.bind(this));
            else
                this.text(filePath, end.bind(this))
        });

        function end(err, text) {
            if (err)
                cb(err, {
                    date: Date.now(),
                    file: this.file.getInfo(),
                    error: true,
                    process: true,
                    text: ""
                });
            else
                cb(null, {
                    date: Date.now(),
                    file: this.file.getInfo(),
                    process: true,
                    text: text
                })
        }
    }

    text(filePath, cb) {
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

    performImage(tmpFilePath, cb) {
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
}

module.exports = TesseractProcess;
