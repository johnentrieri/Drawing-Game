//Dependencies
const express = require('express');
const socket = require('socket.io');
const bodyParser = require('body-parser');

//Local
const db = require('./db')
const router = require('./routes/router');

//MongoDB
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

//App Setup
const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/api/',router);

//Listen
const server = app.listen(4000, () => {console.log('Listening on Port 4000...')});

//WebSocket Setup
const io = socket(server);

//WebSocket Connection
io.on('connection', (socket) => {
    console.log('Made socket connection: ' + socket.id);

    socket.on('draw', (team,points) => {
        io.sockets.emit('draw',team,points);
    });

    socket.on('clear', (team) => {
        io.sockets.emit('clear',team);
    });
})