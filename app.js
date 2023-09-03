const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();

var id = 1;
const welcomeMessage = {
  id: id,
  from: "Ali",
  text: "Welcome to MigraCode chat system!",
};
//This array is our "data store".
//We will start with one message in the array.
//Note: messages will be lost when Glitch restarts our server.
const messages = [welcomeMessage];

// Parse incoming JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  //
  console.log(`
Incoming request: 
    http method: ${req.method}
    url: ${req.url}
    params: ${JSON.stringify(req.params)}
    query: ${JSON.stringify(req.query)}
    body: ${JSON.stringify(req.body)}
`);
  next();
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

//START OF YOUR CODE...
app.get("/messages", function (request, response) {
  response.send(messages);
});

app.get("/messages_search", function (request, response) {
  const searchItem = request.query.text.toLowerCase();
  const searchMessages = messages.filter((message) =>
    message.text.toLowerCase().includes(searchItem)
  );
  if (searchMessages.length > 0) {
    response.status(200).send({
      Results: `Messages with ${searchItem} found successfully`,
      searchMessages,
    });
  } else {
    response.status(404).send({
      Results: `Messages with ${searchItem} didn't find`,
    });
  }
});

app.get("/messages/latest", function (request, response) {
  const latestMessages = messages.slice(Math.max(messages.length - 10, 0));
  response.status(200).send({
    message: "The latest 10 messages",
    latestMessages,
  });
});

app.get("/messages/:id", (request, response) => {
  const messageId = Number(request.params.id);
  const message = messages.find((message) => message.id === messageId);
  if (message) {
    response.status(200).send(message);
  } else {
    response.status(404).send({
      message: `Message with id:${messageId} not found`,
    });
  }
});

app.post("/messages", function (request, response) {
  const newId = Math.max(...messages.map((message) => message.id)) + 1;

  const newMessage = {
    id: newId,
    from: request.body.from,
    text: request.body.text,
    timeSent: new Date()
  };

  if (newMessage.from === "" || newMessage.text === "") {
    response.status(400).send("Name or message is empty");
  } else {
    messages.push(newMessage);
    response.status(201).send(newMessage);
  }
});

app.delete("/messages/:id", function (request, response) {
  const messageId = Number(request.params.id);
  const message = messages.find((message) => message.id === messageId);
  if (message) {
    const index = messages.indexOf(message);
    messages.splice(index, 1);
    response.send(messages);
  } else {
    response.status(404).send({
      message: `Message with id:${messageId} not found`,
    });
  }
});

app.put("/messages/:id", (request, response) => {
  const messageId = Number(request.params.id);
  const message = messages.find((message) => message.id === messageId);
  const newMessage = request.body;
  if (message) {
    message.from = newMessage.from;
    message.text = newMessage.text;
    response.status(200).send(message);
  } else {
    response.status(404).send({
      message: `Message with id:${messageId} not found`,
    });
  }
});


module.exports = app;
