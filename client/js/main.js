'use strict';

var oldQuery = null,
    refreshDelay = 1000;

$(document).ready(function () {
    if (window.localStorage.token)
        showApp();
    else
        showAuth();
    $('#auth-form').on('submit', auth);
    $('#upload-form').on('submit', upload)
});

function showApp() {
    $('#section-auth').hide();
    $('#section-app').show();
    search('', true);
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
            if (err.status == 401)
                showAuth(oldQuery, true)
        }
    })
}

function search(value, force) {
    var query = (value || "").split(' ').join('+');
    if (!force && oldQuery && oldQuery == query)
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
                    '<button type="button" class="close">&times;</button>',

                    '<div class="row">',
                    '<div class="col-lg-3 col-md-6 col-xs-12" >',
                    '<img src="">',
                    '</div>',
                    '<div class="col-lg-9 col-md-6 col-xs-12">',
                    '<p ></p>',
                    '<a href="" target="_blank">',
                    '</div>',
                    '</div>',

                    '</div>',
                    '</div>',
                    '</div>'
                ].join(''));

                result.text = result.text || "";
                result.file = result.file || {};

                $template.find('img').attr('src', result.file.url + '?token=' + window.localStorage.token);
                $template.find('p').text(result.text.substring(0, 1500) + (result.text.length > 1500 ? ' ...' : ''));
                $template.find('a').attr('href', result.file.url + '?token=' + window.localStorage.token);
                $template.find('a').text(result.file.fileName);
                $template.find('.close').on("click", function () {
                    remove(result.file.url)
                });
                $results.append($template)
            });
        },
        error: function (err) {
            console.log(err);
            if (err.status == 401)
                showAuth()
        }
    });
}


function remove(url) {
    $.ajax({
        url: url,
        type: 'DELETE',
        data: {
            token: window.localStorage.token
        },
        success: function () {
            setTimeout(function () {
                search(oldQuery, true);
            }, refreshDelay)
        },
        error: function (err) {
            console.log(err);
            if (err.status == 401)
                showAuth()
        }
    })
}


function upload(e) {
    e.preventDefault();

    var $form = $(this),
        $input = $form.find('input[name=token]');

    if ($input && $input.length)
        $input.attr('value', window.localStorage.token);
    else
        $('<input type="text" name="token">')
            .attr('type', 'hidden')
            .attr('value', window.localStorage.token)
            .appendTo($form);

    $.ajax({
        type: "POST",
        url: "/api/files",
        enctype: 'multipart/form-data',
        data: new FormData(this),
        processData: false,
        contentType: false,
        success: function () {
            setTimeout(function () {
                closeModal();
                search(oldQuery, true);
            }, refreshDelay)
        },
        error: function (err) {
            console.log(err);
            if (err.status == 401)
                showAuth()
        }
    });
}
