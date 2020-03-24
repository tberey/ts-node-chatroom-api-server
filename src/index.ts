/* Server-Side Index Page

NOTES/TODO/BUGS/FIXES:-

==================================================================================================

1) Add profile pic upload option? Shows in account section, as well as a smaller version in the chat.
2) Forgot username/password options. (Add emails, for recovery, to db? or a method of recovery by id?).
3) If emails added to db, send notifications about signing up/forgot details etc.
4) Prevent multiple logging into the same account.

-------------------------------------------------------------------------------------------------
*/

// Global Imported Modules/Dependancies.
import express from "express";
import session from "express-session";
import http from "http";
import SocketIOServer from "socket.io";
import mySQL from "mysql";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";

// Globals Imported external Functions/Data.
import initializeSocketIO from "./socket";
import appRoutes from "./routes";
import privateData from "../config/private.json";

// Global Constants.
const app = express(); // Initialise express web app framework.
const server = new http.Server(app); // Initialise a new server object on http.
const io = SocketIOServer(server, {'path': '/chat'}); // Initialise new instance of socket.io on server.
const port = process.env.PORT || 8001; // Set server port.
const db = mySQL.createConnection(privateData.dbConnection);
const sessionMiddleware = session({
    secret: privateData.sessionSecret,
    saveUninitialized: true,
    resave: true
});

// Initialise a live connection to db, unless error thrown.
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('DB Connected!');
});

io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// Create a private cached session, where username & password are held. Used to store this data past a page/connection redirection.
app.use(sessionMiddleware);

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