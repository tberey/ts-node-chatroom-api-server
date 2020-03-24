// Client-Side Public Scripting for index.ejs (Chatroom).

$(() => {

    //Set extrapolate port from window href, setup Socket.io connection to server/api url, and then request all messages that may already exist.
    var port = (window.location.href).replace(/\D/g,''); // Regex to remove all but integers.
    const socket = io.connect(`http://localhost:${port}`, {'path': '/chat'}); // Set connection URI (+set path).
    socket.emit('allMessages'); // Get existing messages.

    // Declare DOM variables.
    let chatroom = $('#chatroom'); // Display data element.
    let message = $('#message'); // Input text field.
    let sendMessage = $('#submit-message'); // Button.

    let userList = $('#tableStart'); // Display data element.
    let feedback = $('#feedback'); // Display data element.

    let accountInfo = $('#account-info'); // Display data element.

    let updateUserSec = $('#update-username'); // Input Form Section.
    let username = $('#username'); // Input text field.
    let submitUsername = $('#submit-username'); // Button.
    let usernameLog = $('#userlog'); // Display data element.
    let collapseUserSec = $('#collapse-user'); // Collapse Sec Click.

    let updatePassSec = $('#update-password'); // Input Form Section.
    let currentPass = $('#current-password'); // Input text field.
    let newPass = $('#new-password'); // Input text field.
    let confNewPass = $('#confirm-new-password'); // Input text field.
    let submitPassword = $('#submit-password'); // Button.
    let passwordLog = $('#passlog'); // Display data element.
    let collapsePassSec = $('#collapse-pass'); // Collapse Sec Click.

    let promptDelAccount = $('.prompt-delete-account'); // Button.
    let closeAccSec = $('#close-account'); // Input form Section.
    let deleteAccount = $('#submit-delete'); // Button.

    let submitlogout =$('#submit-logout'); // Button.

    // POST Request, to change exisitng username and ammend it to the new value in the sql database.
    $.ajax({
        url:'accountInfo',
        method:'GET',
        success:(response) => {if(typeof response == 'object') accountInfo.html(`<b>Username:</b> ${response.username} | <b>Unique ID:</b> ${response.id}`)}
    });

    // Listen for a click on the collapsable menu for [+/-] Change Password [+/-], in the Account section of the client page chatroom.
    collapsePassSec.click(() => (updatePassSec.css('display') == 'block') ? updatePassSec.css('display','none') : updatePassSec.css('display','block'));

    // Listen for a click on the collapsable menu for [+/-] Change Username [+/-], in the Account section of the client page chatroom.
    collapseUserSec.click(() => (updateUserSec.css('display') == 'block') ? updateUserSec.css('display','none') : updateUserSec.css('display','block'));

    // Listen for a click on the Close Account button, in the Account section of the client page chatroom.
    promptDelAccount.click(() => {
        if (closeAccSec.css('display') == 'block') closeAccSec.css('display','none')
        else {
            closeAccSec.css('display','block');
            $('#accountSection').scrollTop($('#accountSection').prop('scrollHeight'));
        }
    });

    // Listen for a click on the logout button, to logout the user and redirect the client to login/register.
    submitlogout.click(() => {
        // POST Request, to log the client out and redirect.
        $.ajax({
            url:'logout',
            method:'POST',
            success:(response) => {
                socket.emit('disconnect');
                window.location.pathname = response;
            }
        });
    });

    // Listen for change password button click, in order to update a user's password, by PUT request.
    submitPassword.click(() => {
        // Check new passwords entered both match, for user human-error protection, before chaging password request is made.
        if (confNewPass.val() === newPass.val()) {
            // PUT Request, to change exisitng username and ammend it to the new value in the sql database.
            $.ajax({
                url:'changePassword',
                method:'PUT',
                // Data to be sent in request body.
                data: {
                        currentPassword: currentPass.val(),
                        newPassword: newPass.val()
                    },
                success:(response) => {
                    // On successful request, display returned server message and time it out.
                    passwordLog.html(response);
                    setTimeout(() => passwordLog.html(''), 8000);
                    updatePassSec.css('display','none');
                },
                error:(err) => {
                    // On unsuccessful request, display returned server message and time it out.
                    passwordLog.html(err.responseText);
                    $('#accountSection').scrollTop($('#accountSection').prop('scrollHeight'));
                    setTimeout(() => passwordLog.html(''), 8000);
                }
            });
        } else {
            passwordLog.html('The new passwords you entered do not match each other. Please try again.');
            $('#accountSection').scrollTop($('#accountSection').prop('scrollHeight'));
            setTimeout(() => passwordLog.html(''), 10000);
        }
        // Clear input fields, after capturing data.
        currentPass.val('');
        newPass.val('');
        confNewPass.val('');
    });

    // Listen for change username button click, in order to update a user's username, by PUT request.
    submitUsername.click(() => {
        // PUT Request, to change exisitng username and ammend it to the new value in the sql database.
        $.ajax({
            url:'changeUsername',
            method:'PUT',
            // Data to be sent in request body.
            data: {usernameUpdate: username.val()},
            success:(response) => {
                // On successful request, emit change in username to server, to be broadcast out and display the returned server message, which times out.
                socket.emit('changeUsername', {username: username.val()});
                usernameLog.html(`${response.serverMsg}<br>`);
                accountInfo.html(`<b>Username:</b> ${username.val()} | <b>Unique ID:</b> ${response.id}`);
                setTimeout(() => usernameLog.html(''), 8000);
                username.val(''); // Clear input field.
                updateUserSec.css('display','none');
            },
            error:(err) => {
                // On unsuccessful request, display returned server message, and time it out.
                usernameLog.html(`${err.responseText}<br>`);
                $('#accountSection').scrollTop($('#accountSection').prop('scrollHeight'));
                username.val(''); // Clear input field.
                setTimeout(() => usernameLog.html(''), 8000);
            }
        });
    });

    // Listen for a click on the Close Account button, in the Account section of the client page chatroom.
    deleteAccount.click(() => {
        // DELETE Request, to log the client out, delete their account and redirect to login/register.
        $.ajax({
            url:'delete',
            method:'DELETE',
            success:(response) => {
                socket.emit('disconnect');
                window.location.pathname = response;
            },
            error: (response) => {
                socket.emit('disconnect');
                window.location.pathname = response;
            }
        });
    });

    // Emit new message signal, to update server of message to broadcast/emit to connected sockets.
	sendMessage.click(() => {
        socket.emit('newMessage', {message : message.val()});
        message.val('');
    });

    // Bind 'message' DOM Object to the 'keypress' event, to emit the user is typing signal. (I.e. When there's a keypress event on input field, emit the signal).
	message.bind("keypress", () => socket.emit('typing'));

    // Listen for delete user list signal to clear html, in preparation for a new list emitted. Append received data as a msg to html.
    socket.on('deleteList', (data) => {
        userList.html('');
        if (data) chatroom.append(`<p class="message"><b>Server says:</b><br><i>${data}</i></p>`);
        // Set scroll to bottom of appended element on new message.
        $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
    });

    // Listen for the user list items to be emitted by server on connection, and append to html.
    socket.on('userListItem', (data) => userList.append(`<tr><td>${data.name}</td><td>${data.uniqueID}</td></tr>`));
    
    // Listen the full message list being retuned.
    socket.on('msgSetItem', (data) => {
        // Build each message into the page DOM.
		chatroom.append(
            `<p class="message"><b>${data.user.name} says:</b><br><span style="font-family:'Caveat',serif;font-size:x-large;">${data.message}</span></p>
            <sup style="font-size:x-small;">Unique ID: <b>${data.user.uniqueID}</b>; sent <i>${data.datetime}.</i></sup>`
        );
        // Auto-scroll to newest message, at bottom of element.
        $("#chatroom").animate({scrollTop:$("#chatroom")[0].scrollHeight}, 80);
    });

	// Listen for any new messages being broadcast/emitted.
	socket.on('newMessage', (data) => {
        // Build each message into the page DOM.
		chatroom.append(
            `<p class="message"><b>${data.user.name} says:</b><br><span style="font-family:'Caveat',serif;font-size:x-large;">${data.message}</span></p>
            <sup style="font-size:x-small;">Unique ID: <b>${data.user.uniqueID}</b>; sent <i>${data.datetime}.</i></sup>`
        );
        // Set scroll to bottom of appended element on new message.
        $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
    });
    
    // Listen for a user typing signal, to build into Page DOM a message relaying who is typing. Set timer to remove element after 2 seconds.
    let bool = false;
	socket.on('typing', (data) => {
        if (feedback.html().indexOf(data) == -1) feedback.append(`<sub><i><li class="typing">${data} is typing...</i></sub></li>`);
        setTimeout(() => {feedback.html(''); bool=false;}, 2000);
    });
});