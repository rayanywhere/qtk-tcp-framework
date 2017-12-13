const Message = require('../message');
const assert = require('assert');
const EventEmitter = require('events').EventEmitter;

/*============events & params===========*/
/*
    started => ()
    stopped => ()
	connected => (socket)
	closed => (socket)
	error => (socket, err)
	data => (socket, {uuid, buffer})
}
*/

module.exports = class extends EventEmitter {
	constructor(options) {
		super();
		assert(Number.isInteger(options.port), 'options.port is not correctly configured');
		if (options.host === undefined) {
			options.host = '0.0.0.0';
		}

		this._options = options;
		this._socketMap = new Map();
		this._server = undefined;
		this._now = new Date().getTime();
	}

	start() {
		this._server = require('net').createServer(socket => this._accept(socket));
		this._server.listen(this._options.port, this._options.host);

		this._checkupTimer = setInterval(() => {
			this._now = new Date().getTime();
			for (let [socket, lastActiveTime] of this._socketMap) {
				if ((lastActiveTime + 30 * 1000) < this._now) {
					socket.destroy(new Error(`timeout(idle for over 30 seconds`));
				}
			}
		}, 1000);

		this.emit('started');
	}

	stop() {
		if (this._server === undefined) {
			return;
		}
		this._server.close();
		this._server = undefined;
		if (this._checkupTimer) {
			clearInterval(this._checkupTimer);
			this._checkupTimer = undefined;
		}
		this.emit('stopped');
		process.exit(0);
	}

	send(socket, {uuid, buffer}) {
        let outgoingMessage = new Message(Message.SIGN_DATA, buffer, uuid);

        try {
			socket.write(outgoingMessage.toBuffer());
		}
		catch(err) {
			socket.destroy(err);
		}
	}

	_accept(socket) {
		socket.buffer = Buffer.alloc(0);
		socket.on('data', (incomingBuffer) => {
			socket.buffer = Buffer.concat([socket.buffer, incomingBuffer]);
			this._process(socket);
		});
		socket.on('error', error => {
			this.emit('error', socket, error);
		});
		socket.on('close', _ => {
			this._socketMap.delete(socket);
			this.emit('closed', socket);
		});
		this._socketMap.set(socket, this._now);
		this.emit('connected', socket);
	}

	_process(socket) {
		this._socketMap.set(socket, this._now);
		try {
			while(true) {
				let {consumed, message:incomingMessage} = Message.parse(socket.buffer);
				if (consumed === 0) {
					break;
				}
				socket.buffer = socket.buffer.slice(consumed);

				if (incomingMessage.sign === Message.SIGN_DATA) {
					this.emit('data', socket, {uuid: incomingMessage.uuid, buffer: incomingMessage.payload});
				}
			}
		}
		catch(error) {
			socket.destroy(error);
		}
	}
}