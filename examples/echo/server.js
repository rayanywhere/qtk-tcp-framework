const TcpServer = require('../../server');

module.exports = class extends TcpServer {
    constructor() {
        super({port:8212});
    }

    onStarted() {
        console.log("onStarted");
    }

    onStopped() {
        console.log("onStopped");
    }

    onConnected(socket) {
        console.log(`onConnected from ${socket.remoteAddress}:${socket.remotePort}`);
    }

    onClosed(socket) {
        console.log(`onClosed from ${socket.remoteAddress}:${socket.remotePort}`);
    }

    onError(socket, err) {
        console.error(err.stack);
    }

    onMessage(socket, incomingMessage) {
        this.send(socket, incomingMessage);
    }
};