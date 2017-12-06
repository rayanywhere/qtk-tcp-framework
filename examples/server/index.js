const TcpServer = require('../../server');

module.exports = class extends TcpServer {
    constructor() {
        super({port:8212});
    }

    onMessage(socket, incomingMessage) {
        switch(incomingMessage.data.toString('utf-8')) {
            case "echo":
                this.send(socket, incomingMessage);
                break;
            case "delayed_echo":
                setTimeout(() => {
                    this.send(socket, incomingMessage);
                }, 3000);
                break;
            default:
                break;
        }
    }
};