const TcpInstantClient = require('../../client/instant.js');

module.exports = class extends TcpInstantClient {
    constructor() {
        super({port: 8212});
    }
};