const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mysql = require('mysql')
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'chat',
    password: '',
})

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

db.connect((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Connected')
    }
})
// ---------------socket-----------
io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (token === 'secret') {
        next()
    } else {
        next()
        socket.emit('connection_error', {
            message: 'Not auth'
        });
    }
});

io.on("connection", (socket) => {
    let query = 'select * from `messages`'
    db.query(query, (err, messages) => {
        if (err) {
            console.log(err)
        } else {
            messages.forEach((message) => {
                socket.emit('connected', message.text)
            })
        }
    })
    // socket.emit('connected', {
    //     connectionMessage: 'Ready to work',
    // });

    socket.join('room');
    socket.on('message', (messageFromClient) => {
        let query = 'insert into `messages` (`text`) values (?)'
        db.query(query, [messageFromClient], (err) => {
            if (err) {
                console.log(err)
            } else {
                io.to('room').emit('send', {
                    messageToClient: messageFromClient
                })
            }
        });

        // io.to('room').emit('send', {
        //     messageToClient: messageFromClient
        // })
    })
});

httpServer.listen(3001);