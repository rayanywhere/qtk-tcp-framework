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
	
	onData({uuid, buffer}) {}

    onError(err) {}
}
*/

module.exports = class {
	constructor(options) {
		assert(Number.isInteger(options.port), 'options.port is not correctly configured');
        options.host = options.hasOwnProperty('host') ? options.host : options.host = 'localhost';
		this._options = options;

		this._queuedMessages = [];
        this._status = STATUS_DISCONNECTED;
		this._buffer = Buffer.alloc(0);
		this._connect();

		setInterval(() => {
			if (this._status === STATUS_CONNECTED) {
				this._socket.write(new Message(Message.SIGN_PING).toBuffer());
			}
		}, 25 * 1000);
	}

	send({uuid, buffer}) {
		const outgoingMessage = new Message(Message.SIGN_DATA, buffer, uuid);
		if (this._status === STATUS_CONNECTED) {
			this._socket.write(outgoingMessage.toBuffer());
		}
		else {
			this._queuedMessages.push(outgoingMessage);
		}
	}

	_connect() {
		this._status = STATUS_CONNECTING;
		this._socket = net.createConnection(this._options.port, this._options.host, () => {
            if (typeof this.onConnected === 'function') {
				this.onConnected();
			}
			this._status = STATUS_CONNECTED;
			for (let outgoingMessage of this._queuedMessages) {
                this._socket.write(outgoingMessage.toBuffer());
			}
			this._queuedMessages = [];
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
					if (typeof this.onData === 'function') {
						this.onData({uuid:incomingMessage.uuid, buffer:incomingMessage.payload});
					}
				}
			}
		}
		catch(error) {
			this._socket.destroy(error);
		}
	}
};
