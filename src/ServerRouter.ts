import { Server } from "./Server"
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export class ServerRouter extends Server {
    
    constructor(port:number, hostname:string) {
        super(port,hostname);
        this.getRequests(port);
        this.postRequests(port);
        this.putRequests();
        this.deleteRequests();
    }


    private getRequests(port:number):void {
    
        // GET request route, to render and serve the client index login/register page. Include EJS vars placeholder (empty string).
        this.app.get('/', (req:Request,res:Response):void => req.session!.loggedin ? res.status(307).redirect('/chat') : res.status(200).render('index',{msg:``}));

        // GET request, to render and serve client chatroom page, if logged-in, otherwise redirects to root and serves client login page. Include EJS vars data.
        this.app.get('/chat', (req:Request,res:Response):void => req.session!.loggedin ?
        res.status(200).render('chatroom', {data: {username: req.session!.username,uid: req.session!.uid,port:port}}) : res.status(403).redirect('/'));
         
        // Catch all/any unresolved url requests to no-man's land, and redirect to correct location.
        this.app.get('*', (req:Request, res:Response):void => req.session!.loggedin ? res.status(404).redirect('/chat') : res.status(404).redirect('/'));
    }


    private postRequests(port:number):void {
        

        // POST Method for the request made to login, with the details supplied by user queried against the sql db. Set session data and redirect to chat.
        this.app.post('/login', (req:Request, res:Response):void => {

            // Capture username and password, supplied with request body from client.
            let username: string = req.body.username;
            let password: string = req.body.password;

            // Error checking for both username/password combo and return message, else continue with request.
            if (!username && !password) res.status(422).render('index', {msg: `Please enter both a Username and Password.`});
            else if (username && password) {

                // Define db sql script to pass in as an argument with the db query function call, to find user attempting to login.
                const query:string = `SELECT * FROM users WHERE username = '${username}'`;
                this.db.query(query, (err:Error, results:any /*:Array<Object>*/):void => {

                    // DB Query Error handling. Return error and bad status.
                    if (err) res.status(500).render('index', {msg: err});
                    if (err) throw err;

                    // If no user found by username, return bad response to client and send info. Else user found, continue to check password.
                    if (!results.length) res.status(401).render('index', {msg: `Incorrect Username or Password entered. Please try again.`});
                    else if (results.length) {
                        
                        // Unhash found user's password and compare with inputted password.
                        bcrypt.compare(password, results[0].password, (err:Error, result:boolean):Response|void => {

                            // bcrypt unhashing error handling. Return error and bad status.
                            if (err) res.status(500).render('index', {msg: err});
                            if (err) throw err;

                            // If bcrypt return no results, incorrect password so return bad response. Else complete request, and redirect.
                            if (!result) res.status(401).render('index', {msg: `Incorrect Username or Password entered. Please try again.`});
                            else if (result) {
                                
                                // Set request session data to be stored, to remain logged in and pass any data.
                                req.session!.loggedin = true;
                                req.session!.username = username;
                                req.session!.uid = results[0].id;
                                req.session!.save((err:any)=> {if (err) throw err}); // Error handling, saving session data.

                                // Successful request and so send back successful status, render and serve chatroom, with ejs variables data.
                                res.status(200).render('chatroom', {
                                    data: {
                                        username: req.session!.username,
                                        uid: req.session!.uid,
                                        port: port,
                                        msg:'Successfully Logged In'
                                }});
                            }
                        });
                    }
                });
            }
        });


        // POST Method for the request made to register a new, with the details submitted by user added into the sql db as a new row/entry.
        this.app.post('/register', (req:Request, res:Response):void => {
            
            // Capture username and passwords, supplied with request body from client.
            let username: string = req.body.username;
            let password: string = req.body.password;
            let confPassword: string = req.body.confPassword;
            
            // Check for missing or incorrect data, sent with request, and retunr bad response and error message. Else continue with request to register new user.
            if (username.length > 30) res.status(422).render('index', {msg: `Username is too long (Max: 30 Characters). Enter a new username.`});
            else if (password !== confPassword) res.status(422).render('index', {msg: `Your passwords entered did not match. Try again.`});
            else if (!username && !password) res.status(422).render('index', {msg: `Please enter both a Username and Password, and confirm the new password.`});
            else if (username && password) {

                // Define our db sql script to check if the submitted username already exists. Query passed in as an argument with the db query function call.
                const query:string = `SELECT * FROM users WHERE username = '${username}'`; // Query db for specific username.
                this.db.query(query, (err:Error, results:Array<Object>) => {
                    
                    // DB Query error handling. Return error and bad status.
                    if (err) res.status(500).render('index', {msg: err});
                    if (err) throw err;

                    // If db query finds a result, username already exists, so return bad status and message. Else continue to inserting data into sql db.
                    if (results.length) res.status(409).render('index', {msg: `Username already exists. Please try another.`});
                    else if (!results.length) {

                        // Hash the user's submitted password, to store in the sql db, against this new user entry. 10 Passes.
                        bcrypt.hash(password, 10, (err:Error, hash:string) => {

                            // bcrypt hashing error handling. Return error and bad status.
                            if (err) res.status(500).render('index', {msg: err});
                            if (err) throw err;

                            // Define db query and call function to add new row/user into sql db.
                            const query:string = `INSERT INTO users (username, password) VALUES ('${username}','${hash}');`;
                            this.db.query(query, (err:Error) => {
                                
                                // DB Query error handling. Return error and bad status.
                                if (err) res.status(500).render('index', {msg: err});
                                if (err) throw err;
                                
                                // Set the new user's session data so to also login after registering
                                req.session!.loggedin = true;
                                req.session!.username = username;
                                
                                // Define db query and pass into called function to return the ID of the last inputted user, from this connection specifically.
                                const query:string = `SELECT LAST_INSERT_ID();`;
                                this.db.query(query, (err:Error, result:any) => {
                                    
                                    // DB Query error handling. Return error and bad status.
                                    if (err) res.status(500).render('index', {msg: err});
                                    if (err) throw err;

                                    // Set last part of session data for user to login and all correct data sent to rendered ejs page.
                                    req.session!.uid = `${result[0]['LAST_INSERT_ID()']}`;
                                    req.session!.save((err:any)=> {if (err) throw err});

                                    // Render and serve chatroom client page on successful register/login, with success repsonse. Supply ejs variables.
                                    res.status(201).render('chatroom', {
                                        data: {
                                            username: req.session!.username,
                                            uid: req.session!.uid,
                                            port: port,
                                            msg: 'Successfully Registered and Signed In.'
                                    }});  
                                });                          
                            });
                        });
                    }
                });
            }
        });


        // PUT Method for request made to change current username, with the new username supplied by input, and update in the sql db.
        this.app.post('/changeUsername', (req:Request, res:Response):void => {
            
            // Error handling: Break out of function, if user is not logged in, and redirect.
            if (!(req.session!.loggedin)) res.status(404).redirect('/');
            if (!(req.session!.loggedin)) return

            let newUsername: string = req.body.newUsername; // Capture the new username requested change.

            // Check for all and correct data in request and proceed, otherwise return bas status and message.
            if (newUsername.length > 30) res.status(422).send(`Username is too long (Max: 30 Characters). Enter a new username.`);
            else if (!newUsername) res.status(422).send(`Please enter a new username.`);
            else if (newUsername) {

                // Define our db sql script, to find the username supplied, and pass in as an argument with db query call.
                const query:string = `SELECT * FROM users WHERE username = '${newUsername}'`;
                this.db.query(query, (err:Error, results:Array<Object>) => {
                    
                    // DB Query error handling. Return error and bad status.
                    if (err) res.status(500).send(err);
                    if (err) throw err;
                    
                    // If query results found username, return bad status and message. Else continue with request and ammend username in db.
                    if (results.length) res.status(409).send(`Username already exists. Please try another.`);
                    else if (!(results.length)) {
                        
                        // Query to edit the record, contrained by user's current username, with the new username.
                        const query:string = `UPDATE users SET username='${newUsername}' WHERE username='${req.session!.username}';`;
                        this.db.query(query, (err:Error) => {

                            // DB Query error handling. Return error and bad status.
                            if (err) res.status(500).send(err);
                            if (err) throw err;

                            // Update all username session instance with new username.
                            req.session!.username = newUsername;
                            req.session!.save((err:any)=> {if (err) throw err});

                            // Successful request and so send back successful status, and rerender page with server message/new username.
                            res.status(201).render('chatroom', {
                                data: {
                                    username: req.session!.username,
                                    uid: req.session!.uid,
                                    port: port,
                                    msg: `Successfully updated username to '${newUsername}'. Please also now login using this new username.`
                            }});
                        });
                    }
                });
            }
        });


        // POST request, for the client to logout. Clears private session data and redirect client. If already logged out, redirect.
        this.app.post('/logout', (req:Request, res:Response):void => {

            if (!(req.session!.loggedin)) res.status(404).redirect('/'); // Only redirection.
            else if (req.session!.loggedin) {
                // If logged-in, clear session data and then redirect client.
                req.session!.loggedin = false;
                req.session!.username = null;
                req.session!.uid = null;
                req.session!.save((err:any)=> {if (err) throw err});
                res.status(200).redirect('/');
            }
        });
    }


    private putRequests():void {


        // PUT Method for request made to change current password, with the new password supplied by input, and ammend in the sql db.
        this.app.put('/changePassword', (req:Request, res:Response):void => {

            if (!(req.session!.loggedin)) return; // Error handling: do not carry out request (and break out of function), if user is not logged in.
            
            // Capture both the current and new passwords, included with request body.
            let newPassword: string = req.body.newPassword;
            let currentPassword: string = req.body.currentPassword;
            let confPassword: string = req.body.confPassword;
            
            // Check for complete and correct request data, to carry out operation. Otherwise return a bad responseand status, with message.
            if (!newPassword || !currentPassword) res.status(422).send(`Please enter both your current and new password.`);
            else if (newPassword !== confPassword) res.status(422).send(`The new passwords you entered do not match each other. Please try again.`);
            else if (newPassword && currentPassword) {
                
                // Define our db sql script to isolate user's password. Pass in query as an argument with the db query function call.
                const query:string = `SELECT password FROM users WHERE username = '${req.session!.username}'`;
                this.db.query(query, (err:Error, results:any /*:Array<Object>*/) => {
                    
                    // DB Query error handling. Return error and bad status.
                    if (err) res.status(500).send(err); // Error handling. Return error and bad status.
                    if (err) throw err;
                    
                    // Check returned hashed db password matches inputted current password.
                    bcrypt.compare(currentPassword, results[0].password, (err:Error, result:boolean) => {

                        // bcrypt unhashing error handling. Return error and bad status.
                        if (err) res.status(500).send(err);
                        if (err) throw err;

                        // If no results returned, password does not match user's db password, return bad response and message. Else with continue request.
                        if (!result) res.status(401).send('Incorrect current password entered. Please try again.');
                        else if (result) {
                            
                            // Hash the new password to update with. 10 passes.
                            bcrypt.hash(newPassword, 10, (err:Error, hash:string) => {
                                
                                // bcrypt hashing error handling. Return error and bad status.
                                if (err) res.status(500).send(err);
                                if (err) throw err;
                                
                                // Define sql script to update current db hashed password with new hashed password. Pass into query function call to execute.
                                const query:string = `UPDATE users SET password='${hash}' WHERE username='${req.session!.username}';`;
                                this.db.query(query, (err:Error) => {

                                    // DB Query error handling. Return error and bad status.
                                    if (err) res.status(500).send(err);
                                    if (err) throw err;

                                    // Successful request and so send back successful status, with server message.
                                    res.status(201).send(`Successfully updated your password. Please now use this to login.`);
                                });
                            });
                        }
                    });
                });
            }
        });
    }


    private deleteRequests():void {
        
        // DELETE request method to close and delete logged in user's account, by dropping row from sql db, logging out and redirecting client.
        this.app.delete('/delete', (req:Request, res:Response):void => {

             // Only redirect, if user is not logged in. Else carry on with delete request.
            if (!(req.session!.loggedin)) res.status(404).send('/');
            else if (req.session!.loggedin) {

                // Define delete query of user, for db query call argument.
                const query:string = `DELETE FROM users WHERE username='${req.session!.username}';`;
                this.db.query(query, (err:Error) => {

                    // DB Query error handling. Return error and bad status.
                    if (err) res.status(500).send(err);
                    if (err) throw err;
                    
                    // Clear session data to fully logout, and redirect client.
                    req.session!.loggedin = false;
                    req.session!.username = null;
                    req.session!.uid = null;
                    req.session!.save((err:any)=> {if (err) throw err});
                    res.status(200).send('/');
                });
            }
        });
    }
}