// Server Sockets Handling (Connections and Signals) Exported Function

// Dependancies.
import { Server, Socket } from "socket.io";

// Define our interfaces/types.
interface IMessage {
    message: String;
    username: String;
    datetime: String;
    uniqueID: Number;
  };

// Global Constants.
const userList = [];

// Export as function that takes Socket.IO server as argument, and add listeners.
export default (io:Server) => {
    
    // Create new Set (ES6) to hold all chatroom messages history, for a session.
    const messageSet: Set<IMessage> = new Set();

    // Listen for all connections to server.
    io.on('connection', (socket:any, uid:Number, usr:String, connectDateTime:Date) => {

        // Set Socket's id, username and connection details.
        socket.uid = uid = Math.abs(Math.floor(Math.random() * 999 - Math.random() * 999));
        socket.username = usr = `Messenger#${socket.uid}`;
        connectDateTime = new Date(socket.handshake.time);
        
        userList.push(socket.uid); // Build chatroom user list.

        // Informative, logs who has connected and their unique ID.
        console.log(`A new user "${socket.username}", (UniqueID: ${socket.uid}), connected! ${connectDateTime.toLocaleString()}`);

        // Listen for a change in username request, to update it.
        socket.on('changeUsername', (data:any) => {
            socket.username = usr = data.username; // Set user's new username sent with socket signal.
        })

        // Listen for any typing signal, to signal who is typing and broadcast/send to all other sockets connected.
        socket.on('typing', (data:any) => {

            // Broadcast the typing status of user typing. (Broadcast: Send to all sockets but the origin socket which sent the signal 'typing').
            socket.broadcast.emit('typing', {username: socket.username});
        });

        // Listen for any new messages sent, build the message up, and then emit/send to all sockets connected.
        socket.on('newMessage', (data:any) => {
            // Emit/send a new message to all connected sockets, including user who sent it. ('io.sockets' is all connected sockets).
            const newMessage: IMessage = {
                message: data.message,
                username: socket.username,
                datetime: (new Date()).toLocaleString(),
                uniqueID: socket.uid
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
            console.log(`User "${usr}", (UniqueID: ${uid}), disconnected! ${(new Date()).toLocaleString()}`);
        });
    });
};


/* Todo: Setup user type:-
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
*/