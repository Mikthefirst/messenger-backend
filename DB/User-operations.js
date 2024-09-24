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

    //addUser('vbhsdaj', 'Mik', 'Java');
    async addUser(id, username, room) {
        try {
            const res = await db.query('INSERT INTO users VALUES ($1,$2,$3)', [id, username, room]);
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
                console.log(res.rows);
                return res.rows;
            }
        } catch (err) {
            console.error(err);
        }
        return 0;
    }
}

//let user = new userDBOperations();
//user.addUser('1', 'Allah', 'Java');
//user.getUsersByRoom('Java');

module.exports = new userDBOperations();