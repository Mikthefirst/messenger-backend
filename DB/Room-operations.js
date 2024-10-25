const db = require('./dbOption')

class RoomDBOperations {
    async getRoomsIdByUser(nickname, id, numRooms) {
        try {
            let res;
            if (id)
                res = await db.query('SELECT room_id FROM user_rooms WHERE user_id = $1', [id]);
            else if (nickname)
                res = await db.query('SELECT room_id FROM user_rooms WHERE nickname = $1', [nickname]);

            if (res.rowCount != 0) {
                return res.rows;
            }
        }
        catch (e) {
            console.error(e);
            console.log(`Cant get ${nickname} chats`);
        }
        return 0;
    }

    async GetRoomById(id) {
        try {
            let res;
            if (id) {
                res = await db.query('SELECT * FROM rooms WHERE room_id = $1', [id]);
                if (res.rowCount != 0) {
                    return res.rows[0];
                }
            }

        }
        catch (e) {
            console.error(e);
            console.log(`Cant find room by id ${id}}`);
        }
        return 0;
    }

    async GetRoomsByIds(id) {
        if (Array.isArray(id)) {
            let RoomArray = [];
            for (let i = 0; i < id.length; ++i) {
                let buffer = await this.GetRoomById(id[i].room_id);
                if (buffer)
                    RoomArray.push(buffer);
            }
            return RoomArray;
        }
    }
}

module.exports = new RoomDBOperations();