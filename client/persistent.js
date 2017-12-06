const net = require('net');
const Message = require('../message');
const assert = require('assert');

const STATUS_DISCONNECTED = 0;
const STATUS_CONNECTING = 1;
const STATUS_CONNECTED = 2;

/*============Functions that mean to be overwritten===========*/
/*
    onConnected() {}

    onClosed() {}

    onError(err) {}
}
*/

module.exports = class {
	constructor(options) {
		assert(Number.isInteger(options.port), 'options.port is not correctly configured');
        options.host = options.hasOwnProperty('host') ? options.host : options.host = 'localhost';
		this._options = options;

		this._pendingMessages = new Map();
        this._pendings = new Map();
        this._status = STATUS_DISCONNECTED;
		this._buffer = Buffer.alloc(0);
		this._connect();

		setInterval(() => {
			if (this._status === STATUS_CONNECTED) {
				this._socket.write(new Message(Message.SIGN_PING).toBuffer());
			}
		}, 25 * 1000);
	}

	async request(payload, timeout = 30000) {
        let outgoingMessage = new Message(Message.SIGN_DATA, payload);

        return await this._send(outgoingMessage, timeout);
    }

	_send(outgoingMessage, timeout) {
        return new Promise((resolve, reject) => {
            this._pendings.set(outgoingMessage.uuid, {
                success: (response) => resolve(response),
                failure: error => reject(error)
            });

            setTimeout(() => {
                let callback = this._pendings.get(outgoingMessage.uuid);
                if (callback !== undefined) {
                    this._pendings.delete(outgoingMessage.uuid);
                    callback.failure(new Error('request timeout'));
                }
            }, timeout);

            if (this._status === STATUS_CONNECTED) {
                this._socket.write(outgoingMessage.toBuffer());
            }
            else{
                this._pendingMessages.set(outgoingMessage.uuid, outgoingMessage);
			}
        });
	}

	_connect() {
		this._status = STATUS_CONNECTING;
		this._socket = net.createConnection(this._options.port, this._options.host, () => {
            if (typeof this.onConnected === 'function') {
				this.onConnected();
			}
			this._status = STATUS_CONNECTED;
			for (let [uuid, outgoingMessage] of this._pendingMessages) {
                this._socket.write(outgoingMessage.toBuffer());
			}
			this._pendingMessages.clear();
		});
		this._socket.on('data', (incomingBuffer) => {
            this._buffer = Buffer.concat([this._buffer, incomingBuffer]);
			this._process();
		});
		this._socket.on('error', (err) => {
            if (typeof this.onError === 'function') {
				this.onError(err);
			}
		});
		this._socket.on('close', (hasError) => {
            this._close(hasError);
		});
	}

	_close(hasError) {
		if (hasError) {
			this._socket.destroy();
		}
		else {
			this._socket.end();
		}
		this._status = STATUS_DISCONNECTED;
		if (typeof this.onClosed === 'function') {
			this.onClosed();
		}

		setTimeout(() => {
			if (this._status !== STATUS_DISCONNECTED) {
				return;
			}
			this._connect();
		}, 200);
	}

	_process() {
		try {
			while(true) {
				let {consumed, message:incomingMessage} = Message.parse(this._buffer);
				if (consumed === 0) {
					break;
				}
				this._buffer = this._buffer.slice(consumed);

				if (incomingMessage.sign === Message.SIGN_DATA) {
					let callback = this._pendings.get(incomingMessage.uuid);
                    if (callback !== undefined) {
                        this._pendings.delete(incomingMessage.uuid);
                        callback.success(incomingMessage.payload);
                    }
				}
			}
		}
		catch(error) {
			this._socket.destroy(error);
		}
	}
};
