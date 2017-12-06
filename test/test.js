const Server = require('../examples/server');
const fs = require('fs');
const path = require('path');
global.assert = require('assert');

before('start server', async () => {
    (new Server()).start();
});

let cases = fs.readdirSync(__dirname).filter(file => fs.lstatSync(path.join(__dirname, file)).isDirectory());
cases.forEach((c) => {
    require(`${__dirname}/${c}`);
});