require('dotenv').config();
const express = require('express'),
    cors = require('cors'),
    cookieParser = require('cookie-parser'),
    socketIoJwt = require('socketio-jwt'),
    jwt = require('jsonwebtoken'),
    app = express(),
    { Server } = require('socket.io'),
    http = require('http');

const messageDB = require('./DB/Message-operations');
const userDB = require('./DB/User-operations');

//vars

const authServerPort = process.env.PORT;
const port = process.env.SOCKET_PORT;
const secret = process.env.SECRET;

const corsConfig = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
};
// 
//Middleware
//
const server = http.createServer(app);
const io = new Server(server, {
    cors: corsConfig,
});

app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

const CHAT_BOT = 'ChatBot';

io.on('connection', async (socket) => {

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
                let messages = await messageDB.getLastMessages(room, 10);
                //пользователю

                if (messages) {
                    console.log(messages);
                    socket.emit('send_user_message', messages);
                }
                socket.emit('send_user_message', {
                    data: `Welcome ${username}`,
                    username: CHAT_BOT,
                    __createdtime__,
                });

                //пользователям
                const chatRoomUsers = await userDB.getUsersByRoom(room);
                console.log('Пользователи комнаты:', chatRoomUsers);

                //сообщение о присоединении нового юзера.
                console.log('Новый пользователь присоединился');//всем, кроме него
                socket.to(room).emit('send_user_message', {
                    data: `New user joined ${username}`,
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
                data: `User ${username} have leaved the room(`,
                username: CHAT_BOT,
                __createdtime__: __createdtime__
            });
        }
    })
    socket.on('send_message', async (data) => {
        const { username, room, message, __createdtime__ } = data;
        await messageDB.addMessage(username, message, room,);//нужно ещё будет указать время, но лень пака

        io.to(room).emit('send_user_message', {
            data: message,
            username: username,
            __createdtime__: __createdtime__
        })
    })
})

app.post('/app/getCookie', (req, res) => {
    console.log('cookie');
    const { username, room } = req.body;
    console.log('username:', username, 'room:', room);
    if (username && room) {
        console.log('writing cookie...');
        res.cookie('username', `${username}`);
        res.cookie('room', `${room}`);
        res.cookie('token', `${jwt.sign({ username, room }, secret)}`);
        res.status(200).send('Cookies set');
    }
    else {
        res.status(400).send('Error occured sending cookie')
    }
})


server.listen(port, () => {
    console.log(`socket server listening on ${port}(socket.io)`);
})

app.listen(authServerPort, () => {
    console.log('auth server listening on ', authServerPort);
})