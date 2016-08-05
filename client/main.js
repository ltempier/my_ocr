'use strict';

var oldQuery = null,
    token = window.localStorage.token;

$('#authForm').on('submit', function (e) {
    e.preventDefault();
    $.ajax({
        url: '/auth',
        type: 'POST',
        data: $(this).serialize(),
        success: function (results) {
            if (results.success && results.token)
                window.localStorage.token = results.token;
            window.location.href = "/"
        },
        error: function (err) {
            console.log(err)
        }
    })
});

function search(value) {
    var query = value.split(' ').join('+');
    if (oldQuery && oldQuery == query)
        return;
    $.ajax({
        url: '/api/search',
        type: 'GET',
        data: {
            token: window.localStorage.token,
            q: query
        },
        success: function (results) {
            var $results = $("#results");
            $results.empty();
            results.forEach(function (result) {
                var $template = $([
                    ' <div class="col-md-12">',
                    '<div class="panel panel-default">',
                    '<div class="panel-body">',
                    '<div class="media">',
                    '<div class="media-left">',
                    '<img class="media-object" src="">',
                    '</div>',
                    '<div class="media-body">',
                    '<p ></p>',
                    '<a href="" target="_blank">',
                    '</a>',
                    '</div>',
                    '</div>',
                    '</div>',
                    '</div>',
                    '</div>'
                ].join(''));
                $template.find('img').attr('src', result.file.url + '?token=' + window.localStorage.token);
                $template.find('p').text(result.text.substring(0, 1500) + (result.text.length > 1500 ? ' ...' : ''));
                $template.find('a').attr('href', result.file.url + '?token=' + window.localStorage.token);
                $template.find('a').text(result.file.fileName);
                $results.append($template)
            })
        },
        error: function (err) {
            console.log(err)
        }
    });
}

function upload() {
    var $form = $([
        '<form method="POST" enctype="multipart/form-data" action="/files">',
        '<input type="text" name="token" value="' + window.localStorage.token + '"/>',
        '<input type="file" accept="image/*" multiple name="file"/>',
        '</form>'
    ].join(''));

    var $input = $form.find('input');
    $input.on('change', function () {
        $form.submit();
    });

    $form.on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/api/files",
            enctype: 'multipart/form-data',
            data: new FormData(this),
            processData: false,
            contentType: false,
            success: function () {
                alert("Data Uploaded: ");
            },
            error: function (err) {
                console.log(err)
            }
        });
    });
    $input.click();
}

