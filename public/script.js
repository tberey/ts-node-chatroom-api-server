// Client-Side Public Scripting for index.ejs (Chatroom).

$(() => {

    //Set extrapolate port from window href, setup Socket.io connection to server/api url, and then request all messages that may already exist.
    var port = (window.location.href).replace(/\D/g,''); // Regex to remove all but integers.
    const socket = io.connect(`http://localhost:${port}`, {'path': '/chat'});
    socket.emit('allMessages');

    // Declare DOM variables.
	let message = $('#message');
    let username = $('#username');
    let currentPass = $('#current-password');
    let newPass = $('#new-password');
	let sendMessage = $('#submit-message');
    let submitUsername = $('#submit-username');
    let submitPassword = $('#submit-password');
	let chatroom = $('#chatroom');
    let feedback = $('#feedback');
    let usrList = $('#tableStart');
    let accountInfo = $('#account-info');
    let usernameLog = $('#ulog');
    let passwordLog = $('#plog');
    var id;

    // POST Request, to change exisitng username and ammend it to the new value in the sql database.
    $.ajax({
        url:'accountInfo',
        method:'GET',
        data: {
                message: 'Account Information Request'
            },
            success:function(response) {
                if (typeof response == 'object') {
                    id = response.id;
                    accountInfo.html(`<b>Username:</b> ${response.username} | <b>Unique ID:</b> ${response.id}`);
                }
            }
    });

    // Listen for change username button click, in order to update a user's username, by POST request.
    submitUsername.click(() => {

        // POST Request, to change exisitng username and ammend it to the new value in the sql database.
        $.ajax({
            url:'changeUsername',
            method:'POST',

            // Data to be sent in request body.
            data: {
                    usernameUpdate: username.val()
                },

                success:function(response) {
                    // On successful request, emit change in username to server, to be broadcast out and display the returned server message, which times out.
                    socket.emit('changeUsername', {username: username.val()});
                    usernameLog.html(response);
                    accountInfo.html(`<b>Username:</b> ${username.val()} | <b>Unique ID:</b> ${id}`);
                    setTimeout(() => usernameLog.html(''), 10000);
                },

                error:function(err) {
                    
                    // On unsuccessful request, display returned server message, and time it out.
                    usernameLog.html(err.responseText);
                    setTimeout(() => usernameLog.html(''), 10000);
                }
        });
    });

    // Listen for change password button click, in order to update a user's password, by POST request.
    submitPassword.click(() => {

        // POST Request, to change exisitng username and ammend it to the new value in the sql database.
        $.ajax({
            url:'changePassword',
            method:'POST',

            // Data to be sent in request body.
            data: {
                    currentPassword: currentPass.val(),
                    newPassword: newPass.val()
                },

                success:function(response) {
                    // On successful request, display returned server message and time it out.
                    passwordLog.html(response);
                    setTimeout(() => passwordLog.html(''), 10000);
                },

                error:function(err) {
                    // On unsuccessful request, display returned server message and time it out.
                    passwordLog.html(err.responseText);
                    setTimeout(() => passwordLog.html(''), 10000);
                }
        });

        // Clear input fields, after capturing data.
        currentPass.val('');
        newPass.val('');
    });

    // Emit new message signal, to update server of message to broadcast/emit to connected sockets.
	sendMessage.click(() => {
        socket.emit('newMessage', {message : message.val()});
        message.val('');
    });

    // Listen for delete user list signal to clear html, in preparation for a new list emitted. Append received data as a msg to html.
    socket.on('deleteList', (data) => {
        usrList.html('');
        if (data) chatroom.append(`<p class="message"><b>Server says:</b><br><i>${data}</i></p>`);
        
        // Set scroll to bottom of appended element on new message.
        $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
    });

    // Listen for the user list items to be emitted by server on connection, and append to html.
    socket.on('userListItem', (data) => {
        usrList.append(`<tr><td>${data.name}</td><td>${data.uniqueID}</td></tr>`);
    });
    
    // Listen the full message list being retuned.
    socket.on('msgSetItem', (data) => {

        // Build each message into the page DOM.
		chatroom.append(
            `<p class="message"><b>${data.user.name} says:</b><br><i>${data.message}</i></p>
            <sup style="font-size:x-small;">Unique ID: <b>${data.user.uniqueID}</b>; sent <i>${data.datetime}.</i></sup>`
        );
        
        // Auto-scroll to newest message, at bottom of element.
        $("#chatroom").animate({scrollTop:$("#chatroom")[0].scrollHeight}, 80);
        //$('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
    });

	// Listen for any new messages being broadcast/emitted.
	socket.on('newMessage', (data) => {

        // Build each message into the page DOM.
		chatroom.append(
            `<p class="message"><b>${data.user.name} says:</b><br><i>${data.message}</i></p>
            <sup style="font-size:x-small;">Unique ID: <b>${data.user.uniqueID}</b>; sent <i>${data.datetime}.</i></sup>`
        );
        
        // Set scroll to bottom of appended element on new message.
        $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
    });
    
    // Bind 'message' DOM Object to the 'keypress' event, to emit the user is typing signal. (I.e. When there's a keypress event on input field, emit the signal).
	message.bind("keypress", () => {
        socket.emit('typing');
    });
    
    // Listen for a user typing signal, to build into Page DOM a message relaying who is typing. Set timer to remove element after 2 seconds.
    let bool = false;
	socket.on('typing', (data) => {
        if (feedback.html().indexOf(data) == -1) feedback.append(`<sub><i><li class="typing">${data} is typing...</i></sub></li>`);
        setTimeout(() => {feedback.html(''); bool=false;}, 2000);
    });
});