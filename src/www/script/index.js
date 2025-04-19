// src/www/script/index.js
$(document).ready(function () {
    let currentUser = '';
    let currentPass = '';

    // Pomocná funkce pro návrat na stránku registrace/přihlášení
    function showLoginPage() {
        // Skryj after‑login sekci
        $("#afterLogin").hide();
        // Vyčisti seznam a uvítání
        $("#userList").empty();
        $("#welcome").empty();
        // Skryj a vyčisti message
        $("#message").hide().empty();
        // Vyčisti inputy v obou formách
        $("#registerForm")[0].reset();
        $("#loginForm")[0].reset();
        // Zobraz login a registraci
        $("#registerSection, #loginSection").show();
    }

    // Při načtení stránky ukaž login/registraci
    showLoginPage();

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
            success(response) {
                $("#message").show().text(response.message);
            },
            error(xhr) {
                $("#message").show().text(xhr.responseJSON?.message || 'Chyba při registraci.');
            }
        });
    });

    // Přihlášení
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        const username = $("input[name='username']", this).val();
        const password = $("input[name='password']", this).val();

        $.ajax({
            url: '/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success() {
                // Uložíme credentials pro mazání
                currentUser = username;
                currentPass = password;

                // Skryjeme login/registraci
                $("#registerSection, #loginSection, #message").hide();

                // Přivítání
                $("#welcome").text(`Vítej „${username}“`);

                // Načteme a vykreslíme uživatele
                $.get('/users')
                    .done(function (users) {
                        const $list = $("#userList").empty();
                        Object.entries(users).forEach(([user, data]) => {
                            $("<li>").text(`${user}: ${data.password}`).appendTo($list);
                        });
                        $("#afterLogin").show();
                    })
                    .fail(function () {
                        // Pokud selže načtení, vrať se zpět
                        showLoginPage();
                        $("#message").show().text("Nepodařilo se načíst seznam uživatelů.");
                    });
            },
            error(xhr) {
                // Při chybě přihlášení zůstanou vidět formuláře
                $("#message").show().text(xhr.responseJSON?.message || 'Chyba při přihlašování.');
                showLoginPage();
            }
        });
    });

    // Smazání účtu
    $("#deleteAccountBtn").click(function () {
        if (!confirm('Opravdu chceš smazat svůj účet? Tato akce je nevratná.')) return;

        $.ajax({
            url: '/user',
            method: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify({ username: currentUser, password: currentPass }),
            success() {
                // Po úspěchu jdeme zpět na login
                currentUser = '';
                currentPass = '';
                showLoginPage();
            },
            error(xhr) {
                // Při chybě zůstaneme na after‑login a ukážeme zprávu
                $("#message").show().text(xhr.responseJSON?.message || 'Chyba při mazání účtu.');
            }
        });
    });

    // Odhlášení
    $("#logoutBtn").click(function () {
        currentUser = '';
        currentPass = '';
        showLoginPage();
    });
});
