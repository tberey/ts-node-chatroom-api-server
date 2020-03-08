// Server Sockets Handling (Connections and Signals) Exported Function

// Dependancies.
import { Server, Socket } from "socket.io";

// Global Constants.
const userList = [];

// Export as function that takes Socket.IO server as argument, and add listeners.
export default (io:Server) => {

    // Listen for all connections.
    io.on('connection', (socket:any, uid:Number, usr:String, connectDateTime:Date) => {

        // Set socket's id, username and connection details.
        socket.uid = uid = Math.abs(Math.floor(Math.random() * 999 - Math.random() * 999));
        socket.username = usr = `Messenger#${socket.uid}`;
        connectDateTime = new Date(socket.handshake.time);
        
        userList.push(socket.uid);

        // Informative, who has connected and their ID.
        console.log(`A new user "${socket.username}", (UniqueID: ${socket.uid}), connected! ${connectDateTime.toLocaleString()}`);

        // Listen for a change in username request, to update it.
        socket.on('changeUsername', (data:any) => {
            socket.username = usr = data.username; // Set user's new username sent with socket signal.
        })

        // Listen for any new messages sent, build the message up, and then emit/send to all sockets connected.
        socket.on('newMessage', (data:any) => {
            // Emit/send a new message to all connected sockets, including user who sent it. ('io.sockets' is all connected sockets).
            io.sockets.emit('newMessage', {
                message: data.message,
                username: socket.username,
                datetime: (new Date()).toLocaleString(),
                uniqueID: socket.uid
            });
        });

        // Listen for any typing signal, to signal who is typing and broadcast/send to all other sockets connected.
        socket.on('typing', (data:any) => {
            // Broadcast the typing status of user typing. (Broadcast: Send to all sockets but the origin socket which sent the signal 'typing').
            socket.broadcast.emit('typing', {username: socket.username});
        });

        // Listen for any sockets disconnecting, to supply informative information in regards to it.
        socket.on('disconnect', (socket:any) => {
            console.log(`User "${usr}", (UniqueID: ${uid}), disconnected! ${(new Date()).toLocaleString()}`); // Must use 'usr' and 'uid' instead of socket.props, as it is lost on disconnect.
        });
    });
};



/*
// Define our types/interfaces as IUser and IMessage.
export interface IUser {
  id: string;
  name: string;
}

export interface IMessage {
  user: IUser;
  id: string;
  time: Date;
  value: string;
}

// Create a default user, for when no user information received, to still message.
const defaultUser: IUser = {
    id: "messenger",
    name: "Messenger",
  };

// Send message, from client or server, depending who passed the argument with the call, so all will see.
const sendMessage = (socket: Socket | Server) => (message: IMessage) => socket.emit("message", message);

// Export function that takes Socket.IO server as argument, and add listeners.
export default (io: Server) => {
    const messages: Set<IMessage> = new Set(); // Set (ES6) to hold types IMessage, to be built up with received messages.

    // Server listener for incoming connection event to the io server. (Server receives "connection" siganl). Pass in connection/socket as argument.
    io.on("connection", (socket) => {
        
        // Listen for a getMessages signal. Send all current messages to client, in the set 'messages', stored on server const.
        socket.on("getMessages", () => {
            messages.forEach(sendMessage(socket)); // Send each message in set to client(s) on 'socket'.
        });

        // Listen for "message" signal. Signalled each time sendMessage const is called (so for each message in the set).
        socket.on("message", (value: string) => {

            // Provide the message with an id, time-stamp, the user who sent it, and msg body.
            const message: IMessage = {
                id: '' + Math.random()*999,
                time: new Date(),
                user: defaultUser,
                value,
            };

            messages.add(message); // Add message to set.

            sendMessage(io)(message); // Send most recent sent by one client, to all clients connected to the server.
        });
    });
};
*/