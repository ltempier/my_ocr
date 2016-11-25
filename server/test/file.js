"use strict";

var path = require('path'),
    File = require('../components/File');


var filePath = path.join(__dirname, 'IMG_2311.JPG');

var file = new File(filePath);

file.publish()




