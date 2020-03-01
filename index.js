
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const fs = require('fs');

// middleware
const helmet = require('helmet')
app.use(helmet());

var morgan = require('morgan')
app.use(morgan('dev'))

var cors = require('cors')
app.use(cors())

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const dist_dir = `${__dirname}/www/dist`
fs.exists(dist_dir, (exists) => {
    if (exists) {
        console.log('found dist dir');
        app.use(express.static(dist_dir));
        app.get('/', function (req, res, next) {
            res.sendFile(`${dist_dir}/index.html`);
        });
    } else {
        console.log('no dist dir found');
        app.get('/', function (req, res, next) {
            res.send(`unable to locate file <i>${dist_dir}/index.html</i>`);
        });
    }
});

app.use('/api', require('./src/items_router'));

const port = process.env.port || 8021;
server.listen(port);
console.log('Server listening on port:', port);