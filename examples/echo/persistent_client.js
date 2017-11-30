const TcpClient = require('../../client/persistent.js');

module.exports = class extends TcpClient {
    constructor() {
        super({port: 8212});
    }

    onConnected() {
        console.log('persistent client connected');
    }

    onClosed() {
        console.log('persistent client closed');
    }

    onError(err) {
        console.log('persistent client error');
    }
};