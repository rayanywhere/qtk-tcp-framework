const net = require('net');
const Message = require('../message');
const assert = require('assert');

module.exports = class {
	constructor(options) {
		assert(Number.isInteger(options.port), 'options.port is not correctly configured');
        options.host = options.hasOwnProperty('host') ? options.host : options.host = 'localhost';
        options.timeout = Number.isInteger(options.timeout) ? options.timeout : 3;
		this._options = options;

        this._buffer = Buffer.alloc(0);
        this._callback = undefined;
		this._isDataComplete = false;
	}

    request(payload) {
        let outgoingMessage = new Message(Message.SIGN_DATA, payload);
        return new Promise((resolve, reject) => {
            this._callback = {
                success: (response) => resolve(response),
                failure: error => reject(error)
            };

            this._connect();
            this._send(outgoingMessage);
        });
    }

	_connect() {
        this._socket = net.createConnection(this._options.port, this._options.host, () => {
            console.log('client connected event');
        });

        this._socket.on('data', async (incomingBuffer) => {
            console.log('client data event');

            this._process(incomingBuffer);
        });

        this._socket.on('error', (err) => {
            console.log('client error event');
            this._callback.failure(err);
        });
    }

    _send(outgoingMessage) {
        setTimeout(() => {
            if (!this._isDataComplete) {
                this._callback.failure('request timeout');
            }
        }, this._options.timeout * 1000);

        this._socket.write(outgoingMessage.toBuffer());
    }

    _process(incomingBuffer) {
        try {
            this._buffer = Buffer.concat([this._buffer, incomingBuffer]);
            let {consumed, message:incomingMessage} = Message.parse(this._buffer);
            if (consumed !== 0) {
                this._socket.end();
                this._isDataComplete = true;
                this._buffer = this._buffer.slice(consumed);

                if (incomingMessage.sign !== Message.SIGN_DATA) {
                    this._callback.failure(`message sign wrong`);
                }
                this._callback.success(incomingMessage.payload);
            }
        }
        catch(error) {
            this._socket.destroy(error);
        }
    }
};
