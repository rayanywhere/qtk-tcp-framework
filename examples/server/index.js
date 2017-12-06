const TcpServer = require('../../server');

module.exports = class extends TcpServer {
    constructor() {
        super({port:8212});
    }

    onData(socket, {uuid, buffer}) {
        switch(buffer.toString('utf8')) {
            case "echo":
                this.send(socket, {uuid, buffer});
                break;
            case "delayed_echo":
                setTimeout(() => {
                    this.send(socket, {uuid, buffer});
                }, 3000);
                break;
            default:
                break;
        }
    }
};