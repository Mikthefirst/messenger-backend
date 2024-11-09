const router = require('express').Router();
const multer = require('multer');
const image = require('./GetSetImages')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'userImages/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

const fields = [
    { name: 'avatar', maxCount: 3 },
];

router.post('/setImage', upload.fields(fields), image.setImage);
router.get('/getImage', image.getImage);

module.exports = router;