'use strict';

var exec = require('child_process').exec,
    _ = require('lodash'),
    fs = require('fs-extra'),
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
        this.file.moveToTmp((err) => {
            if (err)
                this.text(this.file.originalFilePath, cb);
            else
                this.text(this.file.tmpFilePath, cb)
        });
    }

    text(filePath, cb) {
        if (this.log)
            console.log('start parse file ' + filePath);

        var command = ['java', '-jar', config.TIKA_APP_JAR, '-t', filePath].join(' ');
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
}

module.exports = TikaProcess;
