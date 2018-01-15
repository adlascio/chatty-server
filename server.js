// server.js

const uuid = require('uuid');
const express = require('express');
const WebSocket = require('ws');
const SocketServer = WebSocket.Server;

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

function broadcastClientCount(wss) {
    const connectedClients = Array.from(wss.clients).filter(client => client.readyState === WebSocket.OPEN);
    const clientUpdateMessage = {
        type:"clientUpdate",
        numberOfClients: connectedClients.length
    };
    wss.broadcast(JSON.stringify(clientUpdateMessage));
}

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');
  broadcastClientCount(wss);

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
      console.log('Client disconnected');
      broadcastClientCount(wss);
  }); 
      
  ws.on('message', function(message) {
    //receiving message from client
    console.log("message received", message);
    var msgReceived = JSON.parse(message);

    switch(msgReceived.type) {
        case "postMessage":
          // handle posted message
            let newMessage = {
                id: uuid(),
                username: msgReceived.username,
                content: msgReceived.content,
                type: "incomingMessage",
            };
            wss.broadcast(JSON.stringify(newMessage));
            //ws.send(JSON.stringify(newMessage));
            break;
        case "postNotification":
            // handle posted notification
            let newNotification = {
            id: uuid(),
            currentUser: msgReceived.currentUser,
            newUser: msgReceived.newUser,
            username: msgReceived.username,
            content: msgReceived.content,
            type: "incomingNotification"
        };
            wss.broadcast(JSON.stringify(newNotification));
            break;
        default:
            // show an error in the console if the message type is unknown
            throw new Error("Unknown event type " + data.type);
    }
  });

});

wss.broadcast = function broadcast(data) {
    const connectedClients = Array.from(wss.clients).filter(client => client.readyState === WebSocket.OPEN);
    connectedClients.forEach(client => {
        client.send(data);
    });
};
  