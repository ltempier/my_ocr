'use strict';

var oldQuery = null;
function search(value) {
    var query = value.split(' ').join('+');
    if (oldQuery && oldQuery == query)
        return;

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            oldQuery = query;
            var results = JSON.parse(xmlHttp.responseText);
            var $results = document.getElementById("results");
            $results.innerHTML = results.map(function (result) {
                var template = [
                    ' <div class="col-md-12">',
                    '<div class="panel panel-default">',
                    '<div class="panel-body">',
                    '<div class="media">',
                    '<div class="media-left">',
                    '<img class="media-object" src="' + result.file.url + '">',
                    '</div>',
                    '<div class="media-body">',
                    '<p>',
                    result.text,
                    '</p>',
                    '<a href="' + result.file.url + '" target="_blank">',
                    result.file.fileName,
                    '</a>',
                    '</div>',
                    '</div>',
                    '</div>',
                    '</div>',
                    '</div>'
                ];
                return template.join('')
            }).join('');
        }
    };
    xmlHttp.open("GET", "/search?q=" + query, true);
    xmlHttp.send(null);
}


function upload() {

    var f = document.createElement("form");

    f.setAttribute("method", "POST");
    f.setAttribute("enctype", "multipart/form-data");
    f.setAttribute("action", "/files");

    var x = document.createElement("input");
    x.setAttribute("type", "file");
    x.setAttribute("accept", "image/*");
    x.setAttribute("multiple", "");
    x.setAttribute("name", "file");
    x.addEventListener('change', function (e) {
        e.preventDefault();
        f.submit();
    }, false);

    f.appendChild(x);
    x.click();
}

