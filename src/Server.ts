/* Server-Side Index Page

NOTES/TODO/BUGS/FIXES:-

==================================================================================================

1) Add profile pic upload option? Shows in account section, as well as a smaller version in the chat.
2) Forgot username/password options. (Add emails, for recovery, to db? or a method of recovery by id?).
3) If emails added to db, send notifications about signing up/forgot details etc.
4) Look into OAuth and JWT (JSON Web Tokens)?

-------------------------------------------------------------------------------------------------
*/
import express, {Express} from 'express';
import http from 'http';
import SocketIOServer from "socket.io";
import mySQL, {Connection} from "mysql";
import session from "express-session";
import bodyParser from "body-parser";
import privateData from "./config/private.json";

export class Server {

    private port: string;
    private hostname: string;
    protected app: Express;
    private server: http.Server;
    protected io:SocketIOServer.Server;
    protected db:Connection;
    private sessionMiddleware:express.RequestHandler;

    constructor(port:number, hostname:string) {
        this.port = process.env.PORT || port.toString();
        this.hostname = hostname;
        this.app = express();
        this.server = new http.Server(this.app);
        this.io = SocketIOServer(this.server, {'path': '/chat'}); // send to io class?
        this.db = mySQL.createConnection(privateData.dbConnection);
        this.sessionMiddleware = session({
            //store: new FileStore(),
            cookie: {
                maxAge: 36000000,
                httpOnly: false
              },
            secret: privateData.sessionSecret,
            saveUninitialized: true,
            resave: true
        });

        this.serverSetup();
    }


    private serverSetup():void {
        
        // Express middleware private session data/setup.
        this.io.use((socket, next) => {
            this.sessionMiddleware(socket.request, socket.request.res, next);
        });
        this.app.use(this.sessionMiddleware);

        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());

        this.app.set('view engine', 'ejs');
        this.app.use(express.static('public'));

        
        // Initialise a live connection to db, unless error thrown.
        this.db.connect((err:Error):void => {
            if (err) throw err;
            else console.log('DB Connected!');
        });
        
    }

    public startServer():void {   
        if (this.hostname) this.server.listen(parseInt(this.port), this.hostname, () => console.log(`Server started on http://${this.hostname}:${this.port}`));
        else this.server.listen(this.port, ():void => console.log(`Server started on http://localhost:${this.port}`));
    }
}