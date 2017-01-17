"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || 'docker';

var path = require('path'),
    File = require('../components/File'),
    database = require('../components/database');


var filePath = path.join(__dirname, 'IMG_2311.JPG');

var file = new File(filePath);


database.indexFile(file, function (err, document) {

    if (err)
        console.error(err);
    else {
        file.document = document;
        file.publish();
    }
});





