const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require("path");

// app.use(express.static('public'));

const io = require("socket.io")(server);
app.use((req, res, next) => {
  res.io = io;
  next();
});

// Route: / - Respond with a plain text message "hi"
app.get('/', (req, res) => {
  res.send('hi');
});

// Route: /json - Respond with a JSON object
app.get('/json', (req, res) => {
  const responseObject = {
    text: 'hi',
    numbers: [1, 2, 3]
  };
  res.json(responseObject);
});

// Route: /echo - Echo back the input query parameter in various formats
app.get('/echo', (req, res) => {
  const input = req.query.input;
  if (!input) {
    res.status(400).send('Missing input parameter');
    return;
  }

  const normal = input;
  const shouty = input.toUpperCase();
  const characterCount = input.length;
  const backwards = input.split('').reverse().join('');

  const responseObject = {
    normal,
    shouty,
    characterCount,
    backwards
  };

  res.json(responseObject);
});

// Route: /static/* - Serve static files from the "mychat" directory
app.use("/static", express.static(path.join(__dirname, "public")));

// Route: /chat - Emit a 'message' event with the message from the query parameter
app.get('/chat', (req, res) => {
  const message = req.query.message || "No message";
  res.io.emit("message", message);
  res.send("Message sent: " + message);
});

// Route: /sse - Establish a Server-Sent Events (SSE) connection
app.get('/sse', (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  i = 1;
  setInterval(() => {
    res.write("Hello world " + i + "        \n");
    i++;
    res.write(`data: ${new Date().toLocaleTimeString()}\n\n`);
  }, 1000);

  setTimeout(() => {
    res.end();
  }, 10000);
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('message', (data) => {
    socket.broadcast.emit('message', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


