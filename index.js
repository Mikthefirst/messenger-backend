require('dotenv').config();
const Pool = require('pg').Pool;
const express = require('express'),
    cors = require('cors'),
    app = express();

const db = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    database: process.env.DATABASE
});

app.get('/', (req, res) => {
    res.end('<h1>NIGGA</h1>');
})

const port = process.env.PORT;

app.use(cors({
    origin: "http://localhost:3000"
}));

app.options('*', cors());

app.use(express.json());

app.listen(port, () => {
    console.log('app listening on port', port);
})
