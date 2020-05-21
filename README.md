# User Authenticated Chat Room Browser App: (TypeScript + Node.js + SQL)


***


## A locally hosted http REST API, made in Typescript and Node, with Express and Socket.IO frameworks, supported by a MySQL database.

### <i> Login/Register and join the chatroom, presented in real-time and dynamically. Manage your account, such as changing password or username (which are both needed to login!). Account information is all queried/edited/stored via a MySQL database.

<br>

***

### Client Page (Front-End) Homepage: <br>
#### <b>http://localhost:<Port\>/</b>

***

<br>

***
***

<br>

|Version| Changes|
|:---|:---|
|Version 0.0.1 [2020-03-08]|<ul><li>Initial Commit.</li><li>Add inital directory structure and files.</li><li>Build enables users to join, set a name (or not) and chat with each other.</li><li>Add dynamic 'who is typing' live indicator</li><li>Set un-changable unique ID to users, to trace all messages back to users.</li><li>Add logging/informative details about who connects/disconnects.</li><li>Add timestamp and further styling to messages.</li><li>Add Screenshots dir, and image screenshot files.</li><li>Add README.md</li></ul>|
|Version 0.0.2 [2020-03-09]|<ul><li>Add new set to store chat/conversation history, which is sent to newly connected clients (enables full chat when client joins later/last).</li><li>Remove 'dist' and 'modules' folders. (After adding gitignore.)</li><li>Update README.md</li></ul>|
|Version 0.1.0 [2020-03-10]|<ul><li>Add connected users list to client-side.</li><li>Add new IUser type for user's details, and create new set to hold these (and ammend IMessage type to accept this new type in place of exisiting props).</li><li>Update front-end DOM and appearance, to be more sensical.</li><li>Update public script to accept newly updated types/interfaces.</li><li>Update README.md</li></ul>|
|Version 0.2.0 [2020-03-11]|<ul><li>Update connected users list on client-side, plus styling.</li><li>Update chatroom/message-list to have a scroll (overscroll) feature, for large amounts of messages.</li><li>Add feature to always scroll to bottom of chatroom/messages-list.</li><li>Update the user set list to remove contacts on disconnection, and send updated list out to remaining.</li><li>General code sharpening.</li><li>Update 'Screenshots' dir, with new images.</li><li>Update README.md</li></ul>|
|Version 0.2.1 [2020-03-12]|<ul><li>Add feature to show all users who may be typing concurrently (so more than one at a time).</li><li>Add server messages feature, to alert connected users of updates to other connected users. I.e. connecting/disconnecting.</li><li>Fix bug, where when any user sends a message it would clear all user's input field of text.</li><li>General code sharpening/tidying, and minor client-side DOM adjustments.</li><li>Update README.md</li></ul>|
|Version 0.2.2 [2020-03-13]|<ul><li>Friday the 13th Update, spoooky.</li><li>Add basic mySQL database infrastructure and connection.</li><li>Update Screenshots.</li><li>Update README.md</li></ul>|
|Version 0.2.3 [2020-03-17]|<ul><li>Add further mySQL database infrastructure, including add a new entry row comprised of ID(Pri Key), Username and Password(Hashed).</li><li>Add new front-end form, for use to make a post request on register button, to add new user details to db.</li><li>Add new dependacy/module, for parseing request body.</li><li>Update README.md</li></ul>|
|Version 0.3.0 [2020-03-20]|<ul><li>Big Update - Full SQL Database Integration and Support.</li><li>Add full user authentification to login client page, in order to access chatroom.</li><li>Complete the login client page registration feature, including adding new users as a row to sql db.</li><li>Full chatroom username and unique ID integration with sql db - all details are pulled from db.</li><li>Add my account section to chatroom client page, with an account overview.</li><li>Ability to change password in the my account section of chatroom, reflected into db also.</li><li>Update change username to also update account section and sql database entry.</li><li>Redirections: When not logged in, always redirect too the login client page. When logged in, always redirect to chatroom client page.</li><li>Update README.md</li></ul>|
|Version 0.3.1 [2020-03-21]|<ul><li>Add full catch and redirection system, built up from previous implementation: Now catches any attempted unresolved urls, or unauthorised access (not logged-in), and redirects appropriately.</li><li>Upgrade Account section, when logged in: A further check on changing password, and also move change username to this section. Also add collapsing menu, for all options currently available.</li><li>Adjusted and refine code all around, as well as check and sure up comments. Adjusted so all data now come from server too.</li><li>Bug Fixes and Testing.</li><li>Update README.md</li></ul>|
|Version 0.4.0 [2020-03-23]|<ul><li>Picture Day Update!</li><li>Redesign front-end/client-side: Updated better visuals and slightly altered chatroom layout.</li><li>Adjust css/html for better scaling - Now much more viewable across a range devices/screen sizes.</li><li>Add logout button/feature to account section in ChatRoom which disconnects from chat, logs user out (clears session data), to be returned to login page.</li><li>Adjusted sockets to use session data, rather than exported variables, for login status and username/id.</li><li>Minor routing changes.</li><li>Bug Fixes and Tidy-up.</li><li>Moves sensitive/destructive data to external json file (git-ignored), that is imported and read from.</li><li>Updated all screenshots in Screenshot Directory.</li><li>Update README.md</li></ul>|
|Version 0.4.1 [2020-03-24]|<ul><li>Minor request type changes (post -> delete/put, etc).</li><li>CSS/HTML minor adjustments and fine-tune.</li><li>Add Delete account check and action (with route and request), to delete account from db, log user out and redirect to login/register page.</li><li>Update README.md</li></ul>|
|Version 0.4.2 [2020-03-25]|<ul><li>Add check/feature to prevent multiple instances (or log-in) of the same account.</li><li>Add further error handling/catching for requests/socket-connections, preventing db changes or chatroom/account access, if user is no longer logged in.</li><li>Update README.md</li></ul>|
|Version 0.4.3 [2020-03-26]|<ul><li>Add check/feature to registering, requiring the user to confirm chosen password when signing up, and accompanying client-side error handling (not necessary to be done on server-side, as it is not damaging/deleting any assets if the user is able to skip this check).</li><li>Update README.md</li></ul>|
|Version 1.0.0 [2020-04-02]|<ul><li>1.0 Release!</li><li>Update Types in routing.</li><li>Update README.md</li></ul>|
|Version 2.0.0 [2020-05-18]|<ul><li>TypeScript & Class Update - Whilst already a TypeScript project, it has been further updated to make more and better use of TypeScript features, as well as reconstructed into a more object oriented and class based design. Also sharpened up the code, fixing any mistakes, inconsistencies, or general improvements.</li><li>Update README.md</li></ul>|
|Version 2.1.0 [2020-05-19]|<ul><li>EJS Update - Whilst already a EJS Templated project, it has been further updated to make more and better use of ejs engine features, as well as compacting the code, fixing any mistakes/bugs, inconsistencies, and general improvements.</li><li>Update README.md</li></ul>|
|Version 2.1.1 [2020-05-20]|<ul><li>EJS Update - Further and general improvements.</li><li>Client-side Scripting restructure & tidy-up.</li><li>Update README.md</li></ul>|
|Version 2.2.0 [2020-05-20]|<ul><li>Final EJS Update & Cleanup</li><li>Further client-side Scripting restructure & tidy-up.</li><li>CSS stylesheets consolidation (2=>1).</li><li>Comments rewriting and tidy.</li><li>Final checkovers and tidy up + Testing.</li><li>Update README.md</li></ul>|