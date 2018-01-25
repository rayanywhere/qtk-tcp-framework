const Server = require('../server');
const fs = require('fs');
const path = require('path');

const server = new Server({port:8212});
server.on('data', function (socket, {uuid, data}) {
    switch(data.toString('utf8')) {
        case "echo":
            this.send(socket, {uuid, data});
            break;
        case "delayed_echo":
            setTimeout(() => {
                this.send(socket, {uuid, data});
            }, 3000);
            break;
        default:
            break;
    }
});

before('start server', async () => {
    server.start();
});

let cases = fs.readdirSync(__dirname).filter(file => fs.lstatSync(path.join(__dirname, file)).isDirectory());
cases.forEach((c) => {
    require(`${__dirname}/${c}`);
});