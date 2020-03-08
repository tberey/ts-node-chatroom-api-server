"use strict";
/* Server Side Index Page

NOTES/TODO/BUGS/FIXES:-

==================================================================================================


1) Add <user> has connected/disconnected message. Currently only shows in terminal/console.

2) Show all prior messages on joining chat.

3) Show all users who are currently typing, when more than one simultaneously.

4) Concurrent users connected list.

-------------------------------------------------------------------------------------------------
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependancies.
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
// Import external function.
const socket_1 = __importDefault(require("./socket"));
//Global Constants.
const app = express_1.default(); // Initialise express web app framework.
const server = new http_1.default.Server(app); // Initialise a new server object on http.
const io = socket_io_1.default(server); // Initialise new instance of socket.io on server.
const port = process.env.PORT || 8080; // Set server port.
// Call imported function, passing the io server as argument. The server connects a client via a socket, so another new socket opens for the server to listen for further connections.
socket_1.default(io);
// Set view engine (express page templates engine) to 'ejs' files, to serve client page.
app.set('view engine', 'ejs');
// Specify external scripts directory path/structure to expose, so can be accessed by ejs/html index page script call.
app.use(express_1.default.static('public'));
// Render and serve client index ejs template page, from template engine (views dir).
app.get('/', (req, res) => {
    res.render('index');
});
// Start server and listen on port for incoming connections.
server.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map