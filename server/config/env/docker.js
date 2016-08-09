'use strict';

module.exports = {
    env: 'docker',
    elasticsearch: {
        host: '127.0.0.1:9200'
    },
    TESSDATA_PREFIX: "/usr/src/",
    TIKA_APP_JAR: "/usr/src/tika-app-1.13.jar"
};
