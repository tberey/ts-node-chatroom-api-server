# Chat Room Browser App: (TypeScript + Node.js)


***


## A locally hosted http REST API, made in Typescript and Node, with Express and Socket.IO frameworks.

### <i> Join the chatroom, assign yourself a optional custom user-name, and simply chat or listen to all the users in the session. All done in real-time dynamically.

<br>

***

### Client Page (Front-End) Homepage: <br>
#### <b>http://localhost:<Port\></b>

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