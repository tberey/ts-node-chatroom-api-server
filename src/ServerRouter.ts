import { Server } from "./Server"
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export class ServerRouter extends Server {
    constructor(port:number, hostname:string) {
        super(port,hostname);
        this.getRequests();
        this.postRequests();
        this.putRequests();
        this.deleteRequest();
    }

    private getRequests():void {
    
        // GET request route, to render and serve the client login/register page.
        this.app.get('/', (req:Request,res:Response):void => req.session!.loggedin ? res.status(307).redirect('/chat') : res.status(200).render('index'));

        // GET request, to render and serve client index (chatroom) client page, if logged-in, otherwise redirects to root (and serves client login page).
        this.app.get('/chat', (req:Request,res:Response):void => req.session!.loggedin ? res.status(200).render('chatroom') : res.status(403).redirect('/'));
    
        // GET request for logged-in account information, to be displayed on the client's chatroom page, in the account section.
        this.app.get('/accountInfo', (req:Request, res:Response):void|Response => req.session!.loggedin ? res.status(200).send({id: req.session!.uid, username: req.session!.username}) : res.status(403).redirect('/'));
        
        // Catch all/any unresolved url requests to no-man's land, and direct to correct page.
        this.app.get('*', (req:Request, res:Response):void => req.session!.loggedin ? res.status(404).redirect('/chat') : res.status(404).redirect('/'));
    }


    private postRequests():void {
        
        // POST Method for the request made to login, with the details supplied by user queried against the sql db.
        this.app.post('/login', (req:Request, res:Response):void => {

            // Capture username and password, supplied with request body from client.
            let username: string = req.body.username;
            let password: string = req.body.password;
            
            if (username && password) {
                // If both username and password are supplied by the client request, define our db sql script to pass in as an argument with the db query function call.
                const query:string = `SELECT * FROM users WHERE username = '${username}'`; // Query db for specific username.
                this.db.query(query, (err:Error, results:any /*:Array<Object>*/):Response|void => {

                    if (err) return res.status(500).send(err); // Error handling. Return error and bad status.

                    if (results.length) {
                        // If results returned from db query indicating a correct username, unhash/decrypt corresponding password and compare with inputted password.
                        bcrypt.compare(password, results[0].password, (err:Error, result:boolean):Response|void => {

                            if (err) return res.status(500).send(err); // Error handling. Return error and bad status.

                            if (result) {
                                // After successful password unhashing/decrypting indicating a correct username password pair, set request session data to be stored.
                                req.session!.loggedin = true;
                                req.session!.username = username;
                                req.session!.uid = results[0].id;

                                res.status(200).send(`/chat`); // Successful request and so send back successful status, with redirection to chatroom.
                            
                            // Else, unsuccessful request, username/password incorrect, so return status and message.
                            } else res.status(401).send('Incorrect Username or Password entered. Please try again.');
                        });
                    // Else, unsuccessful request, username/password incorrect, so return status and message.
                    } else res.status(401).send('Incorrect Username or Password entered. Please try again.');
                });
            } else res.status(422).send('Please enter both a Username and Password.'); // Unsuccessful request, as both a username and password were not found in request body.
        });

        // POST Method for the request made to register, with the details supplied by user added to the sql db.
        this.app.post('/register', (req:Request, res:Response):void => {
            
            // Capture username and password, supplied with request body from client.
            let username: string = req.body.username;
            let password: string = req.body.password;
            
            if (username.length > 30) res.status(422).send(`Username is too long (Max: 30 Characters). Enter a new username.`); // Unsuccessful request, as username was too long.
            
            else if (username && password) {
                // If both username and password are supplied by the client request, define our db sql script to pass in as an argument with the db query function call.
                const query:string = `SELECT * FROM users WHERE username = '${username}'`; // Query db for specific username.
                this.db.query(query, (err:Error, results:Array<Object>) => {
                    
                    if (err) return res.status(500).send(err); // Error handling. Return error and bad status.
                    
                    if (!(results.length)) {
                        //If no results returned by query (so chosen username is unique to db), then create a hashed password to store in db, against the new user.
                        bcrypt.hash(password, 10, (err:Error, hash:string) => {
                            // Define db query and call function to add new row/user into sql db.
                            const query:string = `INSERT INTO users (username, password) VALUES ('${username}','${hash}');`;
                            this.db.query(query, (err:Error) => {
                                
                                if (err) return res.status(500).send(err); // Error handling. Return error and bad status.
                                
                                // Successful request and so send back successful status, with server message.
                                res.status(201).send(`Successfully created a new account. Please login using your username '${username}' and password.`);
                            });
                        });
                    } else res.status(409).send(`Username already exists. Please try another.`); // Unsuccessful request, as query found username, so return status and message.
                });
            } else res.status(422).send(`Please enter both a Username and Password.`); // Unsuccessful request, as both a username and password were not found in request body.
        });

        // POST request, for the client to log-out, so clears private session data, sets logged-in to false, and redirects client. If already logged out simply redirects.
        this.app.post('/logout', (req:Request, res:Response):void => {

            if (!(req.session!.loggedin)) return; // Error handling: do not carry out request (and break out of function), if user is not logged in.
            
            if (req.session!.loggedin) {
                // If logged-in, clear session data and redirect client.
                req.session!.loggedin = false;
                req.session!.username = null;
                req.session!.uid = null;
                res.status(200).send('/');
            } else res.status(200).send('/'); // Redirection only.
        });

    }


    private putRequests():void {
        
        // PUT Method for request made to change current username, with the new username supplied by input, and ammend in the sql db.
        this.app.put('/changeUsername', (req:Request, res:Response):void => {
            
            if (!(req.session!.loggedin)) return; // Error handling: do not carry out request (and break out of function), if user is not logged in.

            let newUsername: string = req.body.usernameUpdate; // Capture the new username requested change.

            if (newUsername.length > 30) res.status(422).send(`Username is too long (Max: 30 Characters). Enter a new username.`); // Unsuccessful request, as username was too long.
            else if (newUsername) {
                // If a username is supplied by the client request, define our db sql script to pass it in as an argument with the db query function call.
                const query:string = `SELECT * FROM users WHERE username = '${newUsername}'`; // Query db for specific username.
                this.db.query(query, (err:Error, results:Array<Object>) => {
                    
                    if (err) return res.status(500).send(err); // Error handling. Return error and bad status.
                    
                    if (!(results.length)) {
                        //If no results returned by query (so chosen username is unique to db), then edit the record contrained by current username, to the new username.
                        const query:string = `UPDATE users SET username='${newUsername}' WHERE username='${req.session!.username}';`;
                        this.db.query(query, (err:Error) => {

                            if (err) return res.status(500).send(err); // Error handling. Return error and bad status.

                            req.session!.username = newUsername; // Update all username data instances with new username.

                            // Successful request and so send back successful status, with server message.
                            res.status(201).send({serverMsg: `Successfully updated username to '${newUsername}'. Please also now login using this new username.`, id: req.session!.uid});
                        });
                    } else res.status(409).send(`Username already exists. Please try another.`); // Unsuccessful request, as query found username, so return status and message.
                });
            } else res.status(422).send(`Please enter a new username.`); // Unsuccessful request, as a username was not found in request body.
        });

        // PUT Method for request made to change current password, with the new password supplied by input, and ammend in the sql db.
        this.app.put('/changePassword', (req:Request, res:Response):void => {

            if (!(req.session!.loggedin)) return; // Error handling: do not carry out request (and break out of function), if user is not logged in.
            
            // Capture both the current and new password, included with request body.
            let newPassword: string = req.body.newPassword;
            let currentPassword: string = req.body.currentPassword;
            
            if (newPassword && currentPassword) {
                // If both passwords are supplied by client request, define our db sql script to pass it in as an argument with the db query function call.
                const query:string = `SELECT password FROM users WHERE username = '${req.session!.username}'`;
                this.db.query(query, (err:Error, results:any /*:Array<Object>*/) => {
                    
                    if (err) return res.status(500).send(err); // Error handling. Return error and bad status.
                    
                    // Check returned hashed db password matches inputted current password.
                    bcrypt.compare(currentPassword, results[0].password, (err:Error, result:boolean) => {

                        if (result) {
                            // Current password is a match, so begin db update by hashing the new password.
                            bcrypt.hash(newPassword, 10, (err:Error, hash:string) => {
                                
                                // Define sql script to update current db hashed password with the new hashed password. Pass into query function call, to add to execute action.
                                const query:string = `UPDATE users SET password='${hash}' WHERE username='${req.session!.username}';`;
                                this.db.query(query, (err:Error) => {

                                    if (err) return res.status(500).send(err); // Error handling. Return error and bad status.

                                    // Successful request and so send back successful status, with server message.
                                    res.status(201).send(`Successfully updated your password. Please now use this to login.`);
                                });
                            });
                        } else res.status(401).send('Incorrect current password entered. Please try again.'); // Unsuccessful request, as current passwords did not match.
                    });
                });
            } else res.status(422).send(`Please enter both your current and new password.`); // Unsuccessful request, as both password were not found in request body.
        });

    }


    private deleteRequest():void {
        
        // DELETE Method for request to close and delete user's currently logged-in account, by dropping row from sql db, logging them out/clearing session data and redirecting client.
        this.app.delete('/delete', (req:Request, res:Response):void => {

            if (!(req.session!.loggedin)) return; // Error handling: do not carry out request (and break out of function), if user is not logged in.

            if (req.session!.loggedin) {
                // If user is logged in, proceed with delete query of said user, upon db.
                const query:string = `DELETE FROM users WHERE username='${req.session!.username}';`;
                this.db.query(query, (err:Error) => {

                    if (err) return res.status(500).send(err); // Error handling. Return error and bad status.
                    
                    // Clear session data and redirect client.
                    req.session!.loggedin = false;
                    req.session!.username = null;
                    req.session!.uid = null;
                    return res.status(200).send('/');
                });
            } else res.status(404).send('/'); // Redirect client.
        });
    }
}