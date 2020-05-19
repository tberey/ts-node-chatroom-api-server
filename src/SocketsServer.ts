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

export class SocketsServer extends ServerRouter {
    
    constructor(port:number=3000, hostname:string='') {
        super(port, hostname);
        this.socketHandler();
    }

    private socketHandler():void {
        
        //this.io.on('connection', () => console.log('A connection was made!'));

        // Create new Sets (ES6) to hold all chatroom messages history, and connected users list, for a session.
        const messageSet: Set<IMessage> = new Set();
        const userSet: Set<IUser> = new Set();

        // Listen for all connections to server.
        this.io.on('connection', (socket:Socket):void => {
            
            // On connection, check to see if user/socket is already connected to the server concurrently, if so effectively logging user out (clearing session data).
            userSet.forEach((val:IUser) => {
                if (val.name == socket.request.session.username || val.uniqueID == socket.request.session.uid) {
                    socket.request.session.loggedin = false;
                    socket.request.session.username = null;
                    socket.request.session.uid = null;
                    socket.request.session.save();
                }
            });

            if (!(socket.request.session.loggedin)) {socket.disconnect();return;}; // Disconnect user and break out of function, if the user is not logged-in.
            
            // Create a new server user, using stored request session username and id variables, and also set connection date/time.
            var user:IUser = { uniqueID: socket.request.session.uid, name: socket.request.session.username };

            // Add newly connected user to set, and emit clients to clear exisiting user list (and send a server msg), and replace with updated list (emit to all sockets).
            userSet.add(user);
            var serverMsg:string = `A new messenger has arrived! Welcome '${user.name}'! <i style="font-size:x-small;">[<b>ID:</b> ${user.uniqueID} - ${(new Date(socket.handshake.time)).toLocaleString()}]</i>`;
            this.io.sockets.emit('deleteList', serverMsg);
            userSet.forEach((val) => this.io.sockets.emit('userListItem', val));
            
            // Listen for a change in username request, to update it.
            socket.on('changeUsername', data => {
                
                this.io.sockets.emit('deleteList'); // Inform client to clear it's user list in preparation for the new updated list.

                // Update username in the set and emit new user list to all sockets, then only after do we change username for the connected socket that requested it. Cannot emit a full set, hence iterate through each item.
                userSet.forEach(val => {
                    if (val.name == user.name) val.name = data.username;
                    this.io.sockets.emit('userListItem', val);
                });
                user.name = data.username;
            });

            // Listen for any typing signal, to signal who is typing and broadcast/send to all other sockets connected.
            socket.on('typing', () => {

                // Broadcast the typing status of user typing. (Broadcast: Send to all sockets but the origin socket which sent the signal 'typing').
                socket.broadcast.emit('typing', user.name);
            });

            // Listen for any new messages sent, build the message up, and then emit/send to all sockets connected.
            socket.on('newMessage', data => {
                
                // Emit/send a new message to all connected sockets, including user who sent it. ('io.sockets' is all connected sockets).
                const newMessage: IMessage = {
                    message: data.message,
                    user: user,
                    datetime: (new Date()).toLocaleString()
                }

                // Add the new message to the set, and emit the new message to all sockets.
                messageSet.add(newMessage);
                this.io.sockets.emit('newMessage', newMessage);
            });

            // Listen for an allMessages signal. Send all current messages to client, in the set 'messageSet', stored on server as constant.
            socket.on('allMessages', () => messageSet.forEach(msg => socket.emit('msgSetItem', msg)));

            // Listen for any sockets disconnecting, to supply informative information to be logged.
            socket.on('disconnect', () => {
                
                //socket.request.session.loggedin = false;
                //socket.request.session.username = null;
                //socket.request.session.uid = null;
                //socket.request.session.save();

                // Emit to first clear client-side user lists (and send server msg to chat), next find and delete user from set, then resend user list set to all sockets, item by item.
                serverMsg = `'${user.name}' disconnected, bye! <i style="font-size:x-small;">[<b>ID:</b> ${user.uniqueID} - ${(new Date()).toLocaleString()}]</i>`;
                this.io.sockets.emit('deleteList', serverMsg);
                userSet.forEach(val => {
                    if (val.uniqueID == user.uniqueID) userSet.delete(val);
                    else this.io.sockets.emit('userListItem', val);
                });
            });
        });


    }
}