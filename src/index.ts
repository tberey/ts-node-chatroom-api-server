/* Server Side Index Page

NOTES/TODO/BUGS/FIXES:-

==================================================================================================


1) Add <user> has connected/disconnected message. Currently only shows in terminal/console.

2) Show all prior messages on joining chat.

3) Show all users who are currently typing, when more than one simultaneously.

4) Concurrent users connected list.

5) Add private chat feature? So it is locked to two people max (force newclient to emit "disconnect"?? when sockets > 2).

BUG: When someone sends a message it clears the input message field for all clients!!

-------------------------------------------------------------------------------------------------
*/



// Dependancies.
import express from "express";
import http from "http";
import SocketIOServer from "socket.io";
//import { Server, Socket } from "socket.io";
//import path from "path";

// Import external function.
import initializeSocketIO from "./socket";

//Global Constants.
const app = express(); // Initialise express web app framework.
const server = new http.Server(app); // Initialise a new server object on http.
const io = SocketIOServer(server); // Initialise new instance of socket.io on server.
const port = process.env.PORT || 8080; // Set server port.

// Call imported function, passing the io server as argument. The server connects a client via a socket, so another new socket opens for the server to listen for further connections.
initializeSocketIO(io);

// Set view engine (express page templates engine) to 'ejs' files, to serve client page.
app.set('view engine', 'ejs');

// Specify external scripts directory path/structure to expose, so can be accessed by ejs/html index page script call.
app.use(express.static('public'));

// Render and serve client index ejs template page, from template engine (views dir).
app.get('/', (req,res) => {
    res.render('index');
});

// Start server and listen on port for incoming connections.
server.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});