// Server Sockets Handling (Connections and Signals) Exported Function

// Dependancies.
import {Server, Socket} from "socket.io";

// Define interfaces/types.
export interface IUser {
    name: String;
    uniqueID: Number;
    
};

interface IMessage {
    message: String;
    user: IUser;
    datetime: String;
};


// Export as function that takes Socket.IO server as argument, and add listeners.
export default (io:Server) => {
    
    // Create new Sets (ES6) to hold all chatroom messages history, and connected users list, for a session.
    const messageSet: Set<IMessage> = new Set();
    const userSet: Set<IUser> = new Set();

    // Listen for all connections to server.
    io.on('connection', (socket:Socket, user:IUser, uid: Number, connectDateTime:Date) => {

        // Set Socket's id, username, create a user using this information we just set, and also set connection date/time. Log information to console.
        uid = Math.abs(Math.floor(Math.random() * 999 - Math.random() * 999));
        user = {uniqueID: uid, name: `Messenger#${uid}`};
        connectDateTime = new Date(socket.handshake.time);
        console.log(`A new user "${user.name}", (UniqueID: ${user.uniqueID}), connected! ${connectDateTime.toLocaleString()}`);

        // Add newly connected user to set, and emit clients to clear exisiting, to be replaced with the also emitted updated list (to all sockets).
        userSet.add(user);
        io.sockets.emit('deleteList');
        userSet.forEach((val) => {io.sockets.emit('userListItem', val);});

        // Listen for a change in username request, to update it.
        socket.on('changeUsername', (data) => {
            
            // Inform client to clear it's user list in preparation for the new updated list.
            io.sockets.emit('deleteList');
            // Update username in the set and emit new user list to all sockets, then only after do we change username for the connected socket that requested it. Cannot emit a full set, hence loop.
            userSet.forEach((val) => {
                if (val.name == user.name) val.name = data.username;
                io.sockets.emit('userListItem', val);
            });
            user.name = data.username;
        });

        // Listen for any typing signal, to signal who is typing and broadcast/send to all other sockets connected.
        socket.on('typing', () => {

            // Broadcast the typing status of user typing. (Broadcast: Send to all sockets but the origin socket which sent the signal 'typing').
            socket.broadcast.emit('typing', user.name);
        });

        // Listen for any new messages sent, build the message up, and then emit/send to all sockets connected.
        socket.on('newMessage', (data) => {

            // Emit/send a new message to all connected sockets, including user who sent it. ('io.sockets' is all connected sockets).
            const newMessage: IMessage = {
                message: data.message,
                user: user,
                datetime: (new Date()).toLocaleString()
            }

            // Add the new message to the set, and emit the new message to all sockets.
            messageSet.add(newMessage);
            io.sockets.emit('newMessage', newMessage);
        });

        // Listen for an allMessages signal. Send all current messages to client, in the set 'messageSet', stored on server as constant.
        socket.on("allMessages", () => {
            messageSet.forEach((msg) => {socket.emit('msgSetItem', msg);});
        });

        // Listen for any sockets disconnecting, to supply informative information to be logged.
        socket.on('disconnect', () => {

            // Emit to first clear client-side user lists, next find and delete user from set, then resend user list to all sockets, item by item in the set.
            io.sockets.emit('deleteList');
            userSet.forEach((val) => {
                if (val.uniqueID == user.uniqueID) userSet.delete(val);
                else io.sockets.emit('userListItem', val);
            });
            
            // (Must use 'usr' and 'uid' instead of socket.props, as it is lost on disconnect!!)
            console.log(`User "${user.name}", (UniqueID: ${user.uniqueID}), disconnected! ${(new Date()).toLocaleString()}`);
        });
    });
};