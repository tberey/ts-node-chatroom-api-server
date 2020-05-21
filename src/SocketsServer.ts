// Global imports/dependancies.
import { ServerRouter } from "./ServerRouter";
import { Socket } from "socket.io";
 
// Define our data profiles as interfaces.
interface IUser {
    name: String;
    uniqueID: Number;
};
interface IMessage {
    message: String;
    user: IUser;
    datetime: String;
};

// Socket.io server integration handling class. An instance of this is a fully functioning sockets server, which uses the ServerRouter parent classes.
export class SocketsServer extends ServerRouter {
    
    constructor(port:number=3000, hostname:string='') {
        super(port, hostname);
        this.socketHandler();
    }

    // Method to handle all socket communication, incoming and outgoing.
    private socketHandler():void {

        // Create new Sets (ES6) to hold all chatroom messages history, and connected users list, for a session.
        const messageSet: Set<IMessage> = new Set();
        const userSet: Set<IUser> = new Set();

        // Listen for all connections to server. Upon connections, sets up the handlers for server/peer communication.
        this.io.on('connection', (socket:Socket):void => {
            
            // On connection, check to see if user/socket is already connected to the server concurrently, and log user out (clearing session data) if true.
            userSet.forEach((val:IUser) => {
                if (val.name == socket.request.session.username || val.uniqueID == socket.request.session.uid) {
                    socket.request.session.loggedin = false;
                    socket.request.session.username = null;
                    socket.request.session.uid = null;
                    socket.request.session.save();
                }
            });

            // Disconnect user and break out, if the user is not logged in.
            if (!(socket.request.session.loggedin)) {socket.disconnect();return;};
            
            // Create a new user, using stored request session properties.
            var user:IUser = { uniqueID: socket.request.session.uid, name: socket.request.session.username };

            // Add newly connected user to set, and emit to all clients to clear exisiting user list to replace with updated list. Send server update message in chat.
            userSet.add(user);
            var serverMsg:string = `<p class="message"><b>Server says:</b><br>
                <i>New messenger arrived, welcome '${user.name}'! 
                <i style="font-size:x-small;"><b>ID:</b> ${user.uniqueID} @ ${(new Date(socket.handshake.time)).toLocaleString()}</i></i></p>`;
            this.io.sockets.emit('deleteList', serverMsg);
            userSet.forEach((val) => {
                serverMsg = `<tr><td>${val.name}</td><td>${val.uniqueID}</td></tr>`;
                this.io.sockets.emit('userListItem', serverMsg);
            });
            
            // Listen for a change in username request, to update it.
            socket.on('changeUsername', data => {
                
                serverMsg = ``;
                this.io.sockets.emit('deleteList',serverMsg); // Inform all client to clear user lists, in prep for the new updated list.

                // Update username in the set and emit new user list to all sockets, then only after do we change username for the connected socket that requested it.
                userSet.forEach(val => {
                    if (val.name == user.name) val.name = data.username;
                    serverMsg = `<tr><td>${val.name}</td><td>${val.uniqueID}</td></tr>`;
                    this.io.sockets.emit('userListItem', serverMsg);
                });
                user.name = data.username;

            });

            // Listen for any typing signal including who is typing, and broadcast/send to all other sockets connected, except the source signal.
            socket.on('typingA', () => {
                serverMsg = `<sub><i><li class="typing">${user.name} is typing...</i></sub></li>`;
                socket.broadcast.emit('typingB', {user:user.name, message:serverMsg});
            });

            // Listen for any new messages sent, construct message, and then emit to all sockets, including sender.
            socket.on('newMessageA', data => {
                const newMessage: IMessage = {
                    message: data.message,
                    user: user,
                    datetime: (new Date()).toLocaleString()
                }

                // Add the new message to the set, and emit the new message to all sockets.
                messageSet.add(newMessage);
                serverMsg = `<p class="message"><b>${newMessage.user.name} says:</b><br>
                    <span style="font-family:'Caveat',serif;font-size:x-large;">${newMessage.message}</span></p>
                    <sup style="font-size:x-small;">Unique ID: <b>${newMessage.user.uniqueID}</b>; sent <i>${newMessage.datetime}.</i></sup>`;
                this.io.sockets.emit('newMessageB', serverMsg);
            });

            // Listen for an allMessages signal. Send all current messages to client, in the set 'messageSet', stored on server as constant.
            socket.on('allMessages', () => messageSet.forEach(msg => {  
                serverMsg = `<p class="message"><b>${msg.user.name} says:</b><br>
                    <span style="font-family:'Caveat',serif;font-size:x-large;">${msg.message}</span></p>
                    <sup style="font-size:x-small;">Unique ID: <b>${msg.user.uniqueID}</b>; sent <i>${msg.datetime}.</i></sup>`;
                socket.emit('msgSetItem', serverMsg);
            }));

            // Listen for any sockets disconnecting, to supply informative information to be logged.
            socket.on('disconnect', () => {
                
                // Removes persistent logged-in state if enabled, whenever user reloads page or anything to cause a redirection. Worked around, but an option.
                //socket.request.session.loggedin = false;
                //socket.request.session.username = null;
                //socket.request.session.uid = null;
                //socket.request.session.save();

                // Emit to clear client-side user lists and send server msg to chat. Then find/delete user from set to resend user list to all sockets.
                serverMsg = `<p class="message"><b>Server says:</b><br>
                    '${user.name}' disconnected! 
                    <i style="font-size:x-small;"><b>ID:</b> ${user.uniqueID} @ ${(new Date()).toLocaleString()}</i></i></p>`;
                this.io.sockets.emit('deleteList', serverMsg);
                userSet.forEach(val => {
                    if (val.uniqueID == user.uniqueID) userSet.delete(val);
                    else {
                        serverMsg = serverMsg = `<tr><td>${val.name}</td><td>${val.uniqueID}</td></tr>`;;
                        this.io.sockets.emit('userListItem', serverMsg);
                    }
                });
            });
        });
    }
}