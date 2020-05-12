var express = require('express');
var socket = require('socket.io');

//App Setup
var app = express();
var server = app.listen(4000, () => {console.log('Listening on Port 4000...')});

//Socket Setup
var io = socket(server);

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