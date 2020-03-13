/* Server-Side Index Page

NOTES/TODO/BUGS/FIXES:-

==================================================================================================


1) Add user authetification/login, using sql db (and replace unique id with logged in credentials username, so to keep abaility to change name in chat).

-------------------------------------------------------------------------------------------------
*/



// Dependancies.
import express from "express";
import http from "http";
import SocketIOServer from "socket.io";
import mySQL from "mysql";

// Import external function.
import initializeSocketIO from "./socket";

//Global Constants.
const app = express(); // Initialise express web app framework.
const server = new http.Server(app); // Initialise a new server object on http.
const io = SocketIOServer(server, {'path': '/chat'}); // Initialise new instance of socket.io on server.
const port = process.env.PORT || 8000; // Set server port.
const db = mySQL.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Chatroom_Users'
});


// Call imported function, passing the io server as argument. The server connects a client via a socket, so another new socket opens for the server to listen for further connections.
initializeSocketIO(io);

db.connect((err) => {
    console.log('DB Connected!');
});

// Set view engine (express page templates engine) to 'ejs' files, to serve client page.
app.set('view engine', 'ejs');

// Specify external scripts directory path/structure to expose, so can be accessed by ejs/html index page script call.
app.use(express.static('public'));

// Render and serve client index ejs template page, from template engine (views dir).
app.get('/chat', (req,res) => {
    res.render('index');
});

// Start server and listen on port for incoming connections.
server.listen(port, () => {
    console.log(`server started at http://localhost:${port}/chat`);
});