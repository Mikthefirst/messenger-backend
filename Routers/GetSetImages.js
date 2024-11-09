const userDB = require('../DB/User-operations');
const path = require('node:path');


class ImageWork {
    async getImage(req, res) {
        console.log('/app/getImage');
        const { nickname, username } = req.query;

        const imagePath = (await userDB.GetUserProfileImage(username, nickname)).image;
        if (imagePath !== undefined && imagePath !== null) {
            console.log('image::', imagePath);
            const image = path.join(__dirname, `../userImages/${imagePath}`);
            res.sendFile(image)
        }
        else {
            //res.send('No image');
            res.sendFile(path.join(__dirname, '../userImages/avatarIcon.png'));
            //res.status(404).send('No image available');
        }

    }

    async setImage(req, res) {
        console.log('/app/setImage POST');

        if (req.files === undefined || req.query === undefined) {
            res.status(400).send('Add image or user info in request');
            return;
        }
        console.log('req.files:', req.files);
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
        */
        const { username, nickname } = req.body;
        console.log('user info:', username, nickname);
        console.log('image', imageNames);
        if (Array.isArray(imageNames)) {
            console.log('array performed');
            //Add table for images
            //userDB.ChangeUserProfileImage(username, password, imageNames);
        }
        else {
            userDB.ChangeUserProfileImage(username, nickname, imageNames);
        }
        res.send('Sending file passed correctly');
    }

}

module.exports = new ImageWork();