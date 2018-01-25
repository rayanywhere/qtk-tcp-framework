const EventEmitter = require('events').EventEmitter;
const net = require('net');
const Message = require('../message');
const assert = require('assert');

const STATUS_DISCONNECTED = 0;
const STATUS_CONNECTING = 1;
const STATUS_CONNECTED = 2;

const HEART_BEAT_INTERVAL = 20;
const TIMEOUT_INTERVAL = 30;

/*============events & params===========*/
/*
	data => ({uuid, buffer})
}
*/

module.exports = class extends EventEmitter {
	constructor(options) {
		super();
		assert(Number.isInteger(options.port), 'options.port is not correctly configured');
        options.host = options.hasOwnProperty('host') ? options.host : options.host = 'localhost';
		this._options = options;

        this._queuedMessages = [];
        this._buffer = Buffer.alloc(0);
		this._connect();

		setInterval(() => {
            this._now += 1;
            if ((this._timeHeartbeat + HEART_BEAT_INTERVAL) <= this._now) {
                if (this._status === STATUS_CONNECTED) {
                    this._socket.write(new Message(Message.SIGN_PING).toBuffer());
                }
                this._timeHeartbeat = this._now;
            }
			if ((this._timeLastActive + TIMEOUT_INTERVAL) <= this._now) {
                if (this._status !== STATUS_DISCONNECTED) {
                    this._close();
                }
			}
		}, 1000);
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
        this._now = new Date().getTime();
        this._timeHeartbeat = this._now;
        this._timeLastActive = this._now;
		this._socket = net.createConnection(this._options.port, this._options.host, () => {
			this._status = STATUS_CONNECTED;
			for (let outgoingMessage of this._queuedMessages) {
                this._socket.write(outgoingMessage.toBuffer());
			}
			this._queuedMessages = [];
		});
		this._socket.on('data', (incomingBuffer) => {
            this._buffer = Buffer.concat([this._buffer, incomingBuffer]);
            this._timeLastActive = this._now;
			this._process();
		});
		this._socket.on('close', () => {
            this._close();
		});
	}

	_close() {
        this._socket.end();
		this._status = STATUS_DISCONNECTED;

		setTimeout(() => {
			if (this._status !== STATUS_DISCONNECTED) {
				return;
			}
			this._connect();
		}, 200);
	}

	_process() {
        while(true) {
            let {consumed, message:incomingMessage} = Message.parse(this._buffer);
            if (consumed === 0) {
                break;
            }
            this._buffer = this._buffer.slice(consumed);

            if (incomingMessage.sign === Message.SIGN_DATA) {
                try {
                    this.emit('data', {uuid:incomingMessage.uuid, buffer:incomingMessage.payload});
                }
                catch(err) {
                    continue;
                }
            }
        }
	}
};
