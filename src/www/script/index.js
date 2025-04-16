// src/www/script/index.js
$(document).ready(function () {
    // Registrace
    $("#registerForm").submit(function (event) {
        event.preventDefault();
        $.ajax({
            url: '/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: $("input[name='username']", this).val(),
                password: $("input[name='password']", this).val()
            }),
            success: function (response) {
                $("#message").text(response.message);
            },
            error: function (xhr) {
                $("#message").text(xhr.responseJSON ? xhr.responseJSON.message : 'Chyba pøi registraci.');
            }
        });
    });

    // Pøihlášení
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        $.ajax({
            url: '/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: $("input[name='username']", this).val(),
                password: $("input[name='password']", this).val()
            }),
            success: function (response) {
                $("#message").text(response.message);
            },
            error: function (xhr) {
                $("#message").text(xhr.responseJSON ? xhr.responseJSON.message : 'Chyba pøi pøihlašování.');
            }
        });
    });

    // Smazání úètu
    $("#deleteForm").submit(function (event) {
        event.preventDefault();
        $.ajax({
            url: '/user',
            method: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify({
                username: $("input[name='username']", this).val(),
                password: $("input[name='password']", this).val()
            }),
            success: function (response) {
                $("#message").text(response.message);
            },
            error: function (xhr) {
                $("#message").text(xhr.responseJSON ? xhr.responseJSON.message : 'Chyba pøi mazání úètu.');
            }
        });
    });
});
