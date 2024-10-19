//const db = require('./dbOption');
require('dotenv').config();
const Pool = require('pg').Pool;

const db = new Pool({
    user: 'postgres',
    password: String('246753981'),
    host: 'localhost',
    port: 5432,
    database: 'messengerDB'
});


class userDBOperations {

    //addUser('vbhsdaj', 'Mik', 'Java', '1111');
    async addUser(id, username, room, password) {
        try {
            const userCheck = await db.query('Select * from users where username = $1 AND password = $2', [username, password]);
            if (!userCheck.rowCount)
                await db.query('INSERT INTO users VALUES ($1,$2,$3,$4)', [id, username, room, password]);
            //console.log(res);
        }
        catch (err) {
            console.log('inserting error occured ');
            console.error(err);
        }
    }

    async deleteUserFromRoom(room, username) {
        try {
            const res = await db.query('DELETE FROM users WHERE username = $1 AND room = $2', [username, room]);
            console.log('user was deleted from room');
        }
        catch (err) {
            console.error(err)
            console.log('Deleting wasnt successfull');
        }
    }

    //UserNum- количество пользователей из комнаты.
    async getUsersByRoom(room, UserNum = 15) {
        try {
            const res = await db.query('SELECT username FROM users WHERE room = $1 ORDER BY id desc', [room])
            if (res.rowCount) {
                //console.log(res.rows);
                return res.rows;
            }
        } catch (err) {
            console.error(err);
        }
        return 0;
    }
    async ChangeUserProfileImage(username, password, image) {
        try {
            const res = await db.query('UPDATE users SET image=$1 WHERE username = $2 AND password = $3', [image, username, password])
        }
        catch (err) {
            console.error(err);
            return 0;
        }
    }
    async GetUserProfileImage(username, password) {
        const res = await db.query('Select image From users WHERE username = $1 AND password = $2', [username, password])
        //console.log(res.rows);
        return res.rows[0];
    }
}

//let user = new userDBOperations();
//user.addUser('1', 'Allah', 'Java', '1111');
//user.getUsersByRoom('Java');

module.exports = new userDBOperations();