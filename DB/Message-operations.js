const db = require('./dbOption');

class messageDBOperations {

    //addMessage('mik', 'message payload', 'Gaming');
    async addMessage(nickname, data, room, time) {
        try {
            let res;
            if (time) {
                res = await db.query('INSERT INTO messages (nickname, data, room, __createdtime__)  VALUES ($1,$2,$3,$4)', [nickname, data, room, time]);
            }
            else {
                //console.log(nickname, data, room);
                res = await db.query('INSERT INTO messages (nickname, data, room, __createdtime__)  VALUES ($1,$2,$3,$4)', [nickname, data, room, 'NOW()']);
            }
            //console.log(res);
            return 1;
        }
        catch (err) {
            console.log('inserting error occured ');
            console.error(err);
        }
        return 0;
    }

    //получает rowNum последних сообщений со сдвигом offset
    //.getLastMessages('Gaming', 2);
    async getLastMessages(room, rowNum, offset = 0) {
        try {
            const res = await db.query('SELECT * FROM messages WHERE room = $1 ORDER BY "id" desc LIMIT $2 OFFSET $3', [room, rowNum, offset])
            return res.rows;
        }
        catch (err) {
            console.error(err);
        }
        return 0;
    }
}

module.exports = new messageDBOperations();
//
/*
TABLE messages
(
    "id" INT NOT NULL PRIMARY KEY,
    nickname text NOT NULL,
    "data" text NOT NULL,
    room text NOT NULL,
    __createdtime__ timestamp NOT NULL
)
*/
//
