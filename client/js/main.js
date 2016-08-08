'use strict';

var oldQuery = null,
    token = window.localStorage.token;

$(document).ready(function () {
    if (token)
        showApp();
    else
        showAuth();
    $('#auth-form').on('submit', auth);
    $('#upload-form').on('submit', upload)
});

function showApp() {
    $('#section-auth').hide();
    $('#section-app').show();
    search('');
}

function showAuth() {
    $('#section-auth').show();
    $('#section-app').hide();
    closeModal()
}

function closeModal() {
    $('#upload-modal').modal('hide');
}

function auth(e) {
    e.preventDefault();
    $.ajax({
        url: '/auth',
        type: 'POST',
        data: $(this).serialize(),
        success: function (results) {
            if (results.success && results.token) {
                window.localStorage.token = results.token;
                showApp()
            }
        },
        error: function (err) {
            console.log(err);
            if (err.status != 500)
                showAuth()
        }
    })
}


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
            console.log(err);
            if (err.status != 500)
                showAuth()
        }
    });
}

function upload(e) {
    e.preventDefault();

    var $form = $(this),
        $input = $form.find('input[name=token]');

    if ($input && $input.length)
        $input.attr('value', token);
    else
        $('<input type="text" name="token">')
            .attr('type', 'hidden')
            .attr('value', token)
            .appendTo($form);

    $.ajax({
        type: "POST",
        url: "/api/files",
        enctype: 'multipart/form-data',
        data: new FormData(this),
        processData: false,
        contentType: false,
        success: function () {
            closeModal();
        },
        error: function (err) {
            console.log(err);
            if (err.status != 500)
                showAuth()
        }
    });
}
