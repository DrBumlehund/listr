
const express = require('express');
const app = express();
const helmet = require('helmet')
var morgan = require('morgan')

const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(helmet());
app.use(morgan('short'))

const port = process.env.port || 9988;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dist_dir = `${__dirname}/public`
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

app.use('/api', require('./src/router'));

server.listen(port);
console.log('Server listening on port:', port);