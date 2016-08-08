'use strict';

var exec = require('child_process').exec,
    _ = require('lodash'),
    path = require('path'),
    config = require('../config');


class TikaProcess {

    constructor(file, options) {
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
            else
                this.text(this.file.originalFilePath, end.bind(this));
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

    text(filePath, cb) {
        if (this.log)
            console.log('start parse file ' + filePath);

        var command = ['java', '-jar', config.TIKA_APP_JAR, '-t', this.file.originalFilePath].join(' ');
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

module.exports = TikaProcess;
