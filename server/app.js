const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

var cors = require('cors');

const app = express();
const port = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:9000",
    }
});

app.use(cors())

app.get('/hello', (req, res) => {
    res.json({ msg: 'Chat' })
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// ---------------socket-----------

io.on("connection", (socket) => {
    // console.log(socket);
    socket.emit('connected', {
        message: 'Ready to work',
        anotherMessage: 'And for chat'
    });

    socket.on('message', (arg) => {
        console.log(arg);
        socket.emit('send', {
            newMessage: arg
        })
    })
});
httpServer.listen(3001);