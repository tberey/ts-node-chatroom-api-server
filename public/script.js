// Client-Side Public Scripting

$(() => {

    //Set Socket.io connection to server/api url, (i.e. 'http://localhost:<port>/chat'), set the path, and then request all messages that may already exist.
    let port = (window.location.href).replace(/\D/g,'');
    const socket = io.connect(`http://localhost:${port}`, {'path': '/chat'});
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
    
    //Listen for a user typing signal, to build into Page DOM a message relaying who is typing. Set timer to remove element after 2 seconds.
    let bool = false;
	socket.on('typing', (data) => {
        
        if (feedback.html().indexOf(data) == -1) feedback.append(`<sub><i><li class="typing">${data} is typing...</i></sub></li>`);
        setTimeout(() => {feedback.html(''); bool=false;}, 2000);
    });
});