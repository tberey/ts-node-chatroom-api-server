// Server Sockets Handling (Connections and Signals) Exported Function. Imported into index.ts.

// Global Space
var exportUsername:String;
var exportID:Number;

// Export stored signed-in Username and ID.
export {exportUsername, exportID};

// Exported as anonymous function, and handles all server traffic routing/requests.
export default (app:Function, db:Object, bcrypt:Object) => {

    // GET request, to render and serve the client login/register page.
    app.get('/', (req:Object,res:Object) => req.session.loggedin ? res.status(307).redirect('/chat') : res.status(200).render('login'));

    // GET, to render and serve client index (chatroom) client page, if logged-in, otherwise redirects to root (and serves client login page).
    app.get('/chat', (req:Object,res:Object) => req.session.loggedin ? res.status(200).render('index') : res.status(403).redirect('/'));

    // Client GET request for logged-in account information, to be displayed on the client's chatroom page, in the account section.
    app.get('/accountInfo', (req:Object, res:Object) => req.session.loggedin ? res.status(200).send({id: exportID, username: exportUsername}) : res.status(403).redirect('/'));

    // Catch any unresolved url requests to no-man's land, and direct to correct page.
    app.get('*', (req:Object, res:Object) => req.session.loggedin ? res.status(404).redirect('/chat') : res.status(404).redirect('/'));

    // POST Method for the request made to login, with the details supplied by user queried against the sql db.
    app.post('/login', function(req:Object, res:Object) {
        
        // Capture username and password, supplied with request body from client.
        let username: String = req.body.username;
        let password: String = req.body.password;

        if (username && password) {
            // If both username and password are supplied by the client request, define our db sql script to pass in as an argument with the db query function call.
            const query = `SELECT * FROM users WHERE username = '${username}'`; // Query db for specific username.
            db.query(query, (err:Object, results: Array<Object>) => {

                if (err) return res.status(500).send(err); // Error handling. Return error and bad status.

                if (results.length) {
                    // If results returned from db query indicating a correct username, unhash/decrypt corresponding password and compare with inputted password.
                    bcrypt.compare(password, results[0].password, (err:String, item:String) => {

                        if (err) return res.status(500).send(err); // Error handling. Return error and bad status.

                        if (item) {
                            // After successful password unhashing/decrypting indicating a correct username password pair, set request session data to be stored.
                            req.session.loggedin = true;
                            req.session.username, exportUsername = username;
                            req.session.id, exportID = results[0].id;

                            res.status(200).send(`/chat`); // Successful request and so send back successful status, with redirection to chatroom.
                        
                        // Else, unsuccessful request, username/password incorrect, so return status and message.
                        } else res.status(401).send('Incorrect Username or Password entered. Please try again.');
                    });
                // Else, unsuccessful request, username/password incorrect, so return status and message.
                } else res.status(401).send('Incorrect Username or Password entered. Please try again');
            });
        } else res.status(422).send('Please enter both a Username and Password.'); // Unsuccessful request, as both a username and password were not found in request body.
    });


    // POST Method for the request made to register, with the details supplied by user added to the sql db.
    app.post('/register', (req:Object, res:Object) => {
        
        // Capture username and password, supplied with request body from client.
        let username: String = req.body.username;
        let password: String = req.body.password;

        if (username && password) {
            // If both username and password are supplied by the client request, define our db sql script to pass in as an argument with the db query function call.
            const query = `SELECT * FROM users WHERE username = '${username}'`; // Query db for specific username.
            db.query(query, (err:Object, results:Array<Object>) => {
                
                if (err) return res.status(500).send(err); // Error handling. Return error and bad status.
                
                if (!(results.length)) {
                    //If no results returned by query (so chosen username is unique to db), then create a hashed password to store in db, against the new user.
                    bcrypt.hash(password, 10, (err:String, hash:String) => {
                        // Define db query and call function to add new row/user into sql db.
                        const query = `INSERT INTO users (username, password) VALUES ('${username}','${hash}');`;
                        db.query(query, (err:Object) => {
                            
                            if (err) return res.status(500).send(err); // Error handling. Return error and bad status.
                            
                            // Successful request and so send back successful status, with server message.
                            res.status(201).send(`Successfully created a new account. Please login using your username '${username}' and password.`);
                        });
                    });
                } else res.status(409).send(`Username already exists. Please try another.`); // Unsuccessful request, as query found username, so return status and message.
            });
        } else res.status(422).send(`Please enter both a Username and Password.`); // Unsuccessful request, as both a username and password were not found in request body.
    });

    // POST Method for request made to change current username, with the new username supplied by input, and ammend in the sql db.
    app.post('/changeUsername', (req:Object, res:Object) => {
        
        let newUsername: String = req.body.usernameUpdate; // Capture the new username requested change.
        
        if (newUsername) {
            // If a username is supplied by the client request, define our db sql script to pass it in as an argument with the db query function call.
            var query = `SELECT * FROM users WHERE username = '${newUsername}'`; // Query db for specific username.
            db.query(query, (err:Object, results:Array<Object>) => {
                
                if (err) return res.status(500).send(err); // Error handling. Return error and bad status.
                
                if (!(results.length)) {
                    //If no results returned by query (so chosen username is unique to db), then edit the record contrained by current username, to the new username.
                    query = `UPDATE users SET username='${newUsername}' WHERE username='${exportUsername}';`;
                    db.query(query, (err:Object) => {

                        if (err) return res.status(500).send(err); // Error handling. Return error and bad status.

                        req.session.username, exportUsername = newUsername; // Update all username data instances with new username.

                        // Successful request and so send back successful status, with server message.
                        res.status(201).send({serverMsg: `Successfully updated username to '${newUsername}'. Please also now login using this new username.`, id: exportID});
                    });
                } else res.status(409).send(`Username already exists. Please try another.`); // Unsuccessful request, as query found username, so return status and message.
            });
        } else res.status(422).send(`Please enter a new username.`); // Unsuccessful request, as a username was not found in request body.
    });

    // POST Method for request made to change current password, with the new password supplied by input, and ammend in the sql db.
    app.post('/changePassword', (req:Object, res:Object) => {
        
         // Capture both the current and new password, included with request body.
        let newPassword: String = req.body.newPassword;
        let currentPassword: String = req.body.currentPassword;
        
        if (newPassword && currentPassword) {
            // If both passwords are supplied by client request, define our db sql script to pass it in as an argument with the db query function call.
            var query = `SELECT password FROM users WHERE username = '${exportUsername}'`;
            db.query(query, (err:Object, results:Array<Object>) => {
                
                if (err) return res.status(500).send(err); // Error handling. Return error and bad status.
                
                // Check returned hashed db password matches inputted current password.
                bcrypt.compare(currentPassword, results[0].password, (err:String, item:String) => {

                    if (item) {
                        // Current password is a match, so begin db update by hashing the new password.
                        bcrypt.hash(newPassword, 10, (err:String, hash:String) => {
                            
                            // Define sql script to update current db hashed password with the new hashed password. Pass into query function call, to add to execute action.
                            query = `UPDATE users SET password='${hash}' WHERE username='${exportUsername}';`;
                            db.query(query, (err:Object) => {

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
};