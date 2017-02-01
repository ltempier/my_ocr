'use strict';

module.exports = {
    env: 'docker',
    elasticsearch: {
        host: 'elasticsearch:9200'
    },
    rabbitmq: {
        host: 'rabbitmq',
        port: 5672,
        login: 'ocr',
        password: 'secret_pass'
    },
    TIKA_APP_JAR: '/usr/share/tika/tika-app.jar',
    TESSDATA_PREFIX: '/usr/share/tesseract-ocr/',
    data: '/tmp_data'
};
