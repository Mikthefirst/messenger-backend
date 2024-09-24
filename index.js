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

io.on('connection', async (socket) => {
    //console.log(`User connected ${socket.id}`);
    //console.log(io.sockets);
    socket.on('join_room', async (data) => {
        if (data) {
            const { username, room } = data;
            const __createdtime__ = Date.now();

            socket.join(room);
            userDB.addUser(socket.id, username, room);


            //Сообщение о присоединение пользователя
            //Обновление списка пользователей
            //Покидание комнаты пользователем
            {
                //пользователю
                socket.emit('send_user_message', {
                    message: `Welcome ${username}`,
                    username: CHAT_BOT,
                    __createdtime__,
                });

                //пользователям
                const chatRoomUsers = await userDB.getUsersByRoom(room);
                console.log('Пользователи комнаты:', chatRoomUsers);

                //сообщение о присоединении нового юзера.
                console.log('Новый пользователь присоединился');//всем, кроме него
                socket.to(room).emit('send_user_message', {
                    message: `New user joined ${username}`,
                    username: CHAT_BOT,
                    __createdtime__,
                });

                //лист юзеров отправляется всем в комнате
                io.to(room).emit('user_list', chatRoomUsers);


            }

        }

    });


    socket.on('leave_room', async (data) => {
        if (data) {
            let { room, username } = data;
            const __createdtime__ = Date.now();

            socket.leave(room);
            await userDB.deleteUserFromRoom(room, username);

            const chatRoomUsers = await userDB.getUsersByRoom(room);
            socket.to(room).emit('user_list', chatRoomUsers);

            socket.to(room).emit('send_user_message', {
                message: `User ${username} have leaved the room(`,
                username: CHAT_BOT,
                __createdtime__: __createdtime__
            });
        }
    })
})

server.listen(port, () => {
    console.log(`server listening on ${port}(socket.io)`);
})

