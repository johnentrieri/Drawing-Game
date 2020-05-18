//Dependencies
const express = require('express');
const socket = require('socket.io');

//MongoDB
const db = require('./db')
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

//App Setup
const app = express();
const server = app.listen(4000, () => {console.log('Listening on Port 4000...')});

//REST
app.get('/', (req, res) => {
    res.send('Hello World!')
})

//Socket Setup
const io = socket(server);

//Connection
io.on('connection', (socket) => {
    console.log('Made socket connection: ' + socket.id);

    socket.on('draw', (team,points) => {
        io.sockets.emit('draw',team,points);
    });

    socket.on('clear', (team) => {
        io.sockets.emit('clear',team);
    });
})