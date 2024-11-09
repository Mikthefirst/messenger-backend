require('dotenv').config();
const express = require('express'),
    cors = require('cors'),
    cookieParser = require('cookie-parser'),
    socketIoJwt = require('socketio-jwt'),
    jwt = require('jsonwebtoken'),
    app = express(),
    { Server } = require('socket.io'),
    http = require('http'),
    path = require('node:path');

const messageDB = require('./DB/Message-operations');
const userDB = require('./DB/User-operations');
const RoomDB = require('./DB/Room-operations');

const imageRouter = require('./Routers/ImageRouter');
//vars

const authServerPort = process.env.PORT;
const port = process.env.SOCKET_PORT;
const secret = process.env.SECRET;

const corsConfig = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
};
/*
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'userImages/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });*/
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
            console.log(data);
            const token = await jwt.verify(data.token, secret);
            const nickname = decodeURIComponent(data.nickname);
            const username = decodeURIComponent(data.username);
            const room = decodeURIComponent(data.room);
            const __createdtime__ = Date.now();
            console.log('join_room data:', data);
            console.log('token_data:', token);
            const currentTime = Math.floor(__createdtime__ / 1000);
            if (token.nickname === nickname && token.username === username && currentTime < (token.iat + 3600)) {

                //В руму можно join только если она есть
                socket.join(room);

                //Сообщение о присоединение пользователя
                //Обновление списка пользователей
                //Покидание комнаты пользователем
                console.log('messages')
                {
                    let messages = await messageDB.getLastMessages(room, 10);
                    //пользователю

                    /*if (messages) {
                        //console.log(messages);
                        socket.emit('send_user_message', messages);
                    }
                    socket.emit('send_user_message', {
                        data: `Welcome ${username}`,
                        username: CHAT_BOT,
                        __createdtime__,
                    });*/

                    //пользователям
                    const chatRoomUsers = await userDB.getUsersByRoom(room);
                    //console.log('Пользователи комнаты:', chatRoomUsers);

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



/*
const fields = [
    { name: 'avatar', maxCount: 3 },
];

app.post('/app/setImage/', upload.fields(fields), (req, res) => {
    console.log('/app/setImage POST');
    console.log('file:', req.files);
    const imageNames = req.files.length === 1 ? req.files.avatar[0].originalname : [];
    if (req.files.avatar) {
        req.files.avatar.forEach((el, ind, arr) => {
            if (el.mimetype === 'image/jpeg' || el.mimetype === 'image/png' || el.mimetype === 'image/jpg');
            else { arr.splice(ind, 1) }
            imageNames.push(arr.originalname);
        })
    }
    /*
     avatar: [
    {
      fieldname: 'avatar',
      originalname: 'white_elem.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: 'userImages/',
      filename: 'c6454c1ab555a593635377c7ef8c3008',
      path: 'userImages\\c6454c1ab555a593635377c7ef8c3008',
      size: 233
    }
  ] 
   
    const { username, password } = req.query;
    if (Array.isArray(imageNames)) {
        //Add table for images
        //userDB.ChangeUserProfileImage(username, password, imageNames);
    }
    else {
        userDB.ChangeUserProfileImage(username, password, imageNames);
    }
    console.log('username:', username, '; password: ', password)
    res.send('Sending file passed correctly');
})


app.get('/app/getImage', async (req, res) => {

    const { username, password } = req.query;
    const imagePath = (await userDB.GetUserProfileImage(username, password)).image;
    console.log('/app/getImage');
    console.log('username:', username, '; password: ', password)
    console.log('image::', imagePath);
    const image = path.join(__dirname, `/userImages/${imagePath}`);
    res.sendFile(image)
})
*/




app.use('/app', imageRouter);

app.get('/app/rooms/GetRoomsNickname', async (req, res) => {
    console.log('GetRoomsNickname');
    const { nickname, token } = req.cookies;
    const decodedToken = await jwt.decode(token);

    if (nickname === decodedToken.nickname) {
        const RoomsID = await RoomDB.getRoomsIdByUser(nickname, undefined, 10);
        const Rooms = await RoomDB.GetRoomsByIds(RoomsID);
        if (Rooms) {
            res.send(JSON.stringify(Rooms));
            return;
        }
    }
    res.status(400).send('Error requesting rooms');
})

app.post('/app/getCookie', async (req, res) => {

    const { username, password, nickname } = req.body;

    const validateNickname = (nickname) => {
        const regex = /^@[a-zA-Z_0-9]+$/;
        return regex.test(nickname);
    };

    let resDB;

    if (username && password && nickname && validateNickname(nickname)) {

        resDB = await userDB.addUser(username, nickname, password);
        console.log('resDB:', resDB);
        console.log(!Number.isFinite(resDB));

        if (!Number.isFinite(resDB)) {
            console.log('cookie request declined')
            res.status(400).send(resDB);
            return;
        }
        else {
            console.log('cookie`s writing')
            res.cookie('nickname', `${nickname}`);
            res.cookie('username', `${username}`);
            res.cookie('token', `${jwt.sign({ username, nickname }, secret)}`);
            res.status(200).send('Cookies set');
        }
    }
    else {
        res.status(400).send('Occured error sending cookie');
    }
})





//servers listening
server.listen(port, () => {
    console.log(`socket server listening on ${port}(socket.io)`);
})

app.listen(authServerPort, () => {
    console.log('auth server listening on ', authServerPort);
})