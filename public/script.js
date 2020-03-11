// Client Page Scripting

$(() => {
    //Set Socket.io connection to server/api url, (i.e. 'http://localhost:<port>').
    const socket = io.connect(window.location.href);
    socket.emit('allMessages');

    // Declare DOM variables.
	let message = $('#message');
	let username = $('#username');
	let sendMessage = $('#submit-message');
	let submitUsername = $('#submit-username');
	let chatroom = $('#chatroom');
    let feedback = $('#feedback');
    let usrList = $('#tableStart');
    
    // Emit change in username signal, to update server socket property.
    submitUsername.click(() => {
        socket.emit('changeUsername', {username: username.val()});
    });

    // Emit new message signal, to update server of message to broadcast/emit to connected sockets.
	sendMessage.click(() => {
		socket.emit('newMessage', {message : message.val()});
    });

    // Listen for delete user list signal to clear html, in preparation for a new list emitted.
    socket.on('deleteList', () => {
        usrList.html('');
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
		feedback.html('');
        message.val('');

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
    
    //Listen for a user is typing signal, to build into Page DOM if someone is currently typing a message. Set timer to remove element after 1.25 seconds.
    let bool = false;
	socket.on('typing', (data) => {
        feedback.html(`<sub><i>${data} is typing...</i></sub>`);
        
        if (!(bool)) {
            bool = true;
            setTimeout(() => {feedback.html(''); bool=false;}, 1300);
        }
    });
});