/* Server-Side Index Page

NOTES/TODO/BUGS/FIXES:-

==================================================================================================

1) Add logout button to my account section of Chatroom index page.
2) Add delete account button to my account section of chatroom.
3) Add profile pic upload option? Shows in account section, as well as a smaller version in the chat.
4) Forgot username/password options. (So add emails to db? or method of recovery by id).
5) If emails added to db, send notifications about signing up/forgot details etc.

-------------------------------------------------------------------------------------------------
*/

// Global Dependancies.
import express from "express";
import session from "express-session";
import http from "http";
import SocketIOServer from "socket.io";
import mySQL from "mysql";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";

// Import external functions, as Globals.
import initializeSocketIO from "./socket";
import appRoutes from "./routes"

// Global Constants.
const app = express(); // Initialise express web app framework.
const server = new http.Server(app); // Initialise a new server object on http.
const io = SocketIOServer(server, {'path': '/chat'}); // Initialise new instance of socket.io on server.
const port = process.env.PORT || 8001; // Set server port.
const db = mySQL.createConnection({ // Server connection setup to db.
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Chatroom_Users'
});

// Initialise a live connection to db, unless error thrown.
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('DB Connected!');
});

// Create a private and secure cached session, where username & password are held. Used to store this data past a page/connection redirection.
app.use(session({
    secret: 'SEcReT93',
    resave: false,
    saveUninitialized: true
}));

// Parse data for middleware.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine (express page templates engine) to 'ejs' files, to render/serve client compiled to html. Specify external directories with static files to expose (for access).
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Call imported functions, passing required arguments. The server connects a client via a socket, so another new socket opens for the server to listen for further connections.
appRoutes(app,db,bcrypt);
initializeSocketIO(io);

// Start server and listen on the assigned port for incoming connections.
server.listen(port, () => {
    console.log(`server started at http://localhost:${port}/`);
});