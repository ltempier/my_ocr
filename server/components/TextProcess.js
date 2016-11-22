'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    config = require('../config');


class TextProcess {

    constructor(file, options) {
        this.file = file;
        this.log = false;

        _.each(options, (value, key) => {
            if (!_.isUndefined(value) && !_.isNull(value))
                this[key] = value
        });
    }

    process(cb) {
        this.text(this.file.originalFilePath, cb);
    }

    text(filePath, cb) {
        if (this.log)
            console.log('start parse file ' + filePath);

        fs.readFile(filePath, 'utf8', function (error, stdout) {
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

module.exports = TextProcess;
