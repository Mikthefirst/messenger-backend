require('dotenv').config();
const express = require('express'),
    cors = require('cors'),
    app = express(),
    { Server } = require('socket.io'),
    http = require('http');

const messageDB = require('./DB/Message-operations');
const userDB = require('./DB/User-operations');

//vars


const port = process.env.PORT;
//
//Middleware
//
app.use(cors());
//app.options('*', cors());
app.use(express.json());


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

const CHAT_BOT = 'ChatBot';
let Users = [];

io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on('join_room', (data) => {
        if (data) {
            const { username, room } = data;
            const __createdtime__ = Date.now();

            Users.push({ "id": socket.id, "username": username, "room": room });

            socket.join(room);
            //пользователю
            socket.emit('receive_message', {
                message: `Welcome ${username}`,
                username: CHAT_BOT,
                __createdtime__,
            });
            //пользователям
            const chatRoomUsers = Users.filter((value) => value.room === room);
            socket.to(room).emit('chatroom_users', chatRoomUsers);
            socket.emit(chatRoomUsers);
            //сообщение о присоединении нового юзера.
            socket.to(room).emit('receive_message', {
                message: `${username} has joined the chat room`,
                username: CHAT_BOT,
                __createdtime__,
            });

            socket.on('send_message', (data) => {
                const { message, username, room, __createdtime__ } = data;
                console.log('send_message:   ', data);
                io.in(room).emit('receive_message', data);
            })

        }
        socket.on('message', (socket) => {
            socket
        })
    });

})

server.listen(port, () => {
    console.log(`server listening on ${port}(socket.io)`);
})

