const EchoServer = require('../examples/echo/server.js');
global.assert = require('assert');

before('start server', async () => {
    global.server = new EchoServer();
    await server.start();
});

require('./examples');