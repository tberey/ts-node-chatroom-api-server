// Server Sockets Handling (Connections and Signals) Exported Function

// Dependancies.
import {Server, Socket} from "socket.io";

// Define our interfaces/types.
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
    io.on('connection', (socket:any, user:IUser, connectDateTime:Date) => {

        // Set Socket's id, username, create a user using this information we just set, and also set connection date/time.
        socket.uid = Math.abs(Math.floor(Math.random() * 999 - Math.random() * 999));
        socket.username = `Messenger#${socket.uid}`;
        user = {name: socket.username, uniqueID: socket.uid};
        connectDateTime = new Date(socket.handshake.time);

        // Add this newly connected socket to userSet set, and emit the updated list to all sockets.
        userSet.add(user);
        userSet.forEach((val) => {io.sockets.emit('userList', val);});

        // Informative, logs who has connected and their unique ID.
        console.log(`A new user "${user.name}", (UniqueID: ${user.uniqueID}), connected! ${connectDateTime.toLocaleString()}`);

        // Listen for a change in username request, to update it.
        socket.on('changeUsername', (data:any) => {
            
            // Inform client to clear it's user list in preparation for the new updated list.
            io.sockets.emit('deleteList');

            // Update username in the set and emit new user list to all sockets, then only after do we change username for the connected socket that requested it. Cannot emit a full set, hence loop.
            userSet.forEach((val) => {
                if (val.name == user.name) val.name = data.username;
                io.sockets.emit('userListItem', val);
            });
            socket.username = user.name = data.username;
        });

        // Listen for any typing signal, to signal who is typing and broadcast/send to all other sockets connected.
        socket.on('typing', (data:any) => {

            // Broadcast the typing status of user typing. (Broadcast: Send to all sockets but the origin socket which sent the signal 'typing').
            socket.broadcast.emit('typing', user.name);
        });

        // Listen for any new messages sent, build the message up, and then emit/send to all sockets connected.
        socket.on('newMessage', (data:any) => {

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
        socket.on('disconnect', (socket:any) => {

            // (Must use 'usr' and 'uid' instead of socket.props, as it is lost on disconnect!!)
            console.log(`User "${user.name}", (UniqueID: ${user.uniqueID}), disconnected! ${(new Date()).toLocaleString()}`);
        });
    });
};

/*
// Update username in the set and emit new user list to all sockets, then only after do we change username for the connected socket that requested it.
            userSet.forEach((val) => {
                if (val.name == user.name) val.name = data.username;
                console.log(val);
                io.sockets.emit('userList', val);
            });
            //console.log(userSet);
            //io.sockets.emit('userList', userSet);
            socket.username = user.name = data.username;
*/